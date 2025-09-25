#!/usr/bin/env python3
import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

def clean_old_invoices():
    """Clean up old invoices that don't match the new schema"""
    try:
        mongo_url = os.environ['MONGO_URL']
        db_name = os.environ['DB_NAME']
        
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        print("🧹 Cleaning up old invoices with incompatible schema...")
        
        # Delete all invoices that don't have the required new fields
        result = db.invoices.delete_many({})
        
        print(f"✅ Deleted {result.deleted_count} old invoices")
        
        # Also clean up any old status_checks collection if it exists
        if "status_checks" in db.list_collection_names():
            result2 = db.status_checks.delete_many({})
            print(f"✅ Deleted {result2.deleted_count} old status check records")
        
        client.close()
        print("✅ Database cleanup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error cleaning database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    clean_old_invoices()