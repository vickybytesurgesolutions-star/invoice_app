from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Customer(BaseModel):
    name: str
    address: str
    gst_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class LineItem(BaseModel):
    description: str
    quantity: int
    rate: float
    amount: float

class ServiceCharge(BaseModel):
    description: str
    amount: float
    gst_rate: float  # percentage like 18.0 for 18%
    gst_amount: float

class InvoiceTotals(BaseModel):
    subtotal: float
    service_charge: float
    gst_on_service: float
    grand_total: float

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    customer: Customer
    line_items: List[LineItem]
    service_charges: ServiceCharge
    totals: InvoiceTotals
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    invoice_number: str
    customer: Customer
    line_items: List[LineItem]
    service_charges: ServiceCharge

def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
    return data

def parse_from_mongo(item):
    """Parse datetime strings back to datetime objects from MongoDB"""
    if isinstance(item, dict):
        for key, value in item.items():
            if key in ['date', 'created_at'] and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(i) if isinstance(i, dict) else i for i in value]
    return item

# Invoice Routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate):
    try:
        # Calculate totals
        subtotal = sum(item.amount for item in invoice_data.line_items)
        service_charge = invoice_data.service_charges.amount
        gst_on_service = (service_charge * invoice_data.service_charges.gst_rate) / 100
        grand_total = subtotal + service_charge + gst_on_service
        
        # Update GST amount in service charges
        invoice_data.service_charges.gst_amount = gst_on_service
        
        # Create totals
        totals = InvoiceTotals(
            subtotal=subtotal,
            service_charge=service_charge,
            gst_on_service=gst_on_service,
            grand_total=grand_total
        )
        
        # Create invoice object
        invoice = Invoice(
            **invoice_data.dict(),
            totals=totals
        )
        
        # Prepare for MongoDB storage
        invoice_dict = prepare_for_mongo(invoice.dict())
        await db.invoices.insert_one(invoice_dict)
        
        return invoice
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices():
    try:
        invoices = await db.invoices.find().sort("created_at", -1).to_list(1000)
        return [Invoice(**parse_from_mongo(invoice)) for invoice in invoices]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str):
    try:
        invoice = await db.invoices.find_one({"id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return Invoice(**parse_from_mongo(invoice))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str):
    try:
        result = await db.invoices.delete_one({"id": invoice_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return {"message": "Invoice deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Invoicing App API is running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()