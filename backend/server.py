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
from datetime import datetime, timezone, timedelta

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
class CompanyDetails(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    zip_code: str
    country: str = "India"
    phone: str
    email: str
    website: Optional[str] = ""
    gstin: str
    logo_url: Optional[str] = ""
    bank_name: str
    account_number: str
    ifsc_code: str
    branch: str
    branch_code: str

class CompanyDetailsCreate(BaseModel):
    company_name: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    zip_code: str
    country: str = "India"
    phone: str
    email: str
    website: Optional[str] = ""
    gstin: str
    logo_url: Optional[str] = ""
    bank_name: str
    account_number: str
    ifsc_code: str
    branch: str
    branch_code: str

class Customer(BaseModel):
    name: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    zip_code: str
    country: str = "India"
    gstin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class LineItem(BaseModel):
    description: str
    hsn_sac: str
    quantity: int
    rate: float
    amount: float

class ServiceCharge(BaseModel):
    description: str
    hsn_sac: str = "998314"  # Default SAC for business support services
    amount: float
    cgst_rate: float = 9.0  # 9% CGST
    sgst_rate: float = 9.0  # 9% SGST  
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    total_gst: float = 0.0

class InvoiceTotals(BaseModel):
    subtotal: float
    service_charge: float
    total_cgst: float
    total_sgst: float
    total_gst: float
    grand_total: float
    amount_in_words: str

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    invoice_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: datetime
    payment_terms: str = "30 days"
    po_number: Optional[str] = ""
    place_of_supply: str
    customer: Customer
    line_items: List[LineItem]
    service_charges: ServiceCharge
    totals: InvoiceTotals
    terms_conditions: str = "Payment should be made within the specified due date. Interest @24% will be charged on delayed payments."
    notes: str = "This is a system-generated invoice and has been digitally signed. No physical signature is required. The GST is applied on the service charges."
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    invoice_number: str
    due_date: datetime
    payment_terms: str = "30 days"
    po_number: Optional[str] = ""
    place_of_supply: str
    customer: Customer
    line_items: List[LineItem]
    service_charges: ServiceCharge
    terms_conditions: Optional[str] = "Payment should be made within the specified due date. Interest @24% will be charged on delayed payments."
    notes: Optional[str] = "This is a system-generated invoice and has been digitally signed. No physical signature is required. The GST is applied on the service charges."

class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    due_date: Optional[datetime] = None
    payment_terms: Optional[str] = None
    po_number: Optional[str] = None
    place_of_supply: Optional[str] = None
    customer: Optional[Customer] = None
    line_items: Optional[List[LineItem]] = None
    service_charges: Optional[ServiceCharge] = None
    terms_conditions: Optional[str] = None
    notes: Optional[str] = None

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
            if key in ['invoice_date', 'due_date', 'created_at', 'updated_at'] and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(i) if isinstance(i, dict) else i for i in value]
    return item

def number_to_words(number):
    """Convert number to words (Indian numbering system)"""
    def convert_hundreds(n):
        ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", 
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", 
                "Seventeen", "Eighteen", "Nineteen"]
        
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
        
        result = ""
        
        if n >= 100:
            result += ones[n // 100] + " Hundred "
            n %= 100
            
        if n >= 20:
            result += tens[n // 10] + " "
            n %= 10
            
        if n > 0:
            result += ones[n] + " "
            
        return result.strip()
    
    if number == 0:
        return "Zero Rupees Only"
    
    # Split into crores, lakhs, thousands, hundreds
    crores = int(number) // 10000000
    lakhs = (int(number) % 10000000) // 100000
    thousands = (int(number) % 100000) // 1000
    hundreds = int(number) % 1000
    
    result = ""
    
    if crores > 0:
        result += convert_hundreds(crores) + " Crore "
        
    if lakhs > 0:
        result += convert_hundreds(lakhs) + " Lakh "
        
    if thousands > 0:
        result += convert_hundreds(thousands) + " Thousand "
        
    if hundreds > 0:
        result += convert_hundreds(hundreds)
        
    return result.strip() + " Rupees Only"

def calculate_totals_and_gst(line_items, service_charges):
    """Calculate invoice totals with CGST/SGST breakdown"""
    subtotal = sum(item.amount for item in line_items)
    
    # Calculate GST on service charges
    cgst_amount = (service_charges.amount * service_charges.cgst_rate) / 100
    sgst_amount = (service_charges.amount * service_charges.sgst_rate) / 100
    total_gst = cgst_amount + sgst_amount
    
    # Update service charges GST amounts
    service_charges.cgst_amount = cgst_amount
    service_charges.sgst_amount = sgst_amount
    service_charges.total_gst = total_gst
    
    grand_total = subtotal + service_charges.amount + total_gst
    amount_in_words = number_to_words(grand_total)
    
    return InvoiceTotals(
        subtotal=subtotal,
        service_charge=service_charges.amount,
        total_cgst=cgst_amount,
        total_sgst=sgst_amount,
        total_gst=total_gst,
        grand_total=grand_total,
        amount_in_words=amount_in_words
    )

# Company Details Routes
@api_router.post("/company", response_model=CompanyDetails)
async def create_or_update_company_details(company_data: CompanyDetailsCreate):
    try:
        # Check if company details already exist
        existing = await db.company_details.find_one({})
        
        if existing:
            # Update existing
            company_dict = prepare_for_mongo(company_data.dict())
            await db.company_details.update_one({}, {"$set": company_dict})
            company_dict['id'] = existing.get('id', str(uuid.uuid4()))
        else:
            # Create new
            company = CompanyDetails(**company_data.dict())
            company_dict = prepare_for_mongo(company.dict())
            await db.company_details.insert_one(company_dict)
            
        return CompanyDetails(**parse_from_mongo(company_dict))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/company", response_model=Optional[CompanyDetails])
async def get_company_details():
    try:
        company = await db.company_details.find_one({})
        if company:
            return CompanyDetails(**parse_from_mongo(company))
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Invoice Routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate):
    try:
        # Calculate totals and GST
        totals = calculate_totals_and_gst(invoice_data.line_items, invoice_data.service_charges)
        
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

@api_router.put("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, invoice_data: InvoiceUpdate):
    try:
        # Get existing invoice
        existing_invoice = await db.invoices.find_one({"id": invoice_id})
        if not existing_invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Update only provided fields
        update_data = invoice_data.dict(exclude_unset=True)
        if update_data:
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            # If line_items or service_charges are updated, recalculate totals
            if 'line_items' in update_data or 'service_charges' in update_data:
                existing_invoice.update(update_data)
                parsed_invoice = parse_from_mongo(existing_invoice)
                invoice_obj = Invoice(**parsed_invoice)
                
                totals = calculate_totals_and_gst(invoice_obj.line_items, invoice_obj.service_charges)
                update_data['totals'] = totals.dict()
            
            # Prepare for MongoDB update
            prepared_data = prepare_for_mongo(update_data)
            await db.invoices.update_one({"id": invoice_id}, {"$set": prepared_data})
        
        # Get updated invoice
        updated_invoice = await db.invoices.find_one({"id": invoice_id})
        return Invoice(**parse_from_mongo(updated_invoice))
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
    return {"message": "Professional Tax Invoicing App API is running"}

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