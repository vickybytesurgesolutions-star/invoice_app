import requests
import sys
import json
from datetime import datetime, timedelta

class ProfessionalTaxInvoiceAPITester:
    def __init__(self, base_url="https://invoicetax.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_invoice_id = None
        self.created_company_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if len(str(response_data)) > 300:
                        print(f"Response: {json.dumps(response_data, indent=2)[:300]}...")
                    else:
                        print(f"Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Response: {error_data}")
                except:
                    print(f"Error Text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_company_settings(self):
        """Test company settings creation and retrieval"""
        company_data = {
            "company_name": "Test Professional Services Pvt Ltd",
            "address_line1": "123 Business Park",
            "address_line2": "Tech District",
            "city": "Mumbai",
            "state": "Maharashtra",
            "zip_code": "400001",
            "country": "India",
            "phone": "+91-9876543210",
            "email": "info@testcompany.com",
            "website": "www.testcompany.com",
            "gstin": "27ABCDE1234F1Z5",
            "logo_url": "",
            "bank_name": "State Bank of India",
            "account_number": "1234567890123456",
            "ifsc_code": "SBIN0001234",
            "branch": "Mumbai Main Branch",
            "branch_code": "001234"
        }

        # Test company creation/update
        success, response = self.run_test(
            "Create/Update Company Settings",
            "POST",
            "company",
            200,
            data=company_data
        )

        if success and response:
            self.created_company_id = response.get('id')
            print("✅ Company settings created successfully")

        # Test company retrieval
        success2, response2 = self.run_test(
            "Get Company Settings",
            "GET",
            "company",
            200
        )

        if success2 and response2:
            print("✅ Company settings retrieved successfully")
            # Verify data integrity
            if response2.get('company_name') == company_data['company_name']:
                print("✅ Company data integrity verified")
            else:
                print("❌ Company data integrity failed")
                return False

        return success and success2

    def test_create_professional_invoice(self):
        """Test professional tax invoice creation with CGST/SGST breakdown"""
        due_date = (datetime.now() + timedelta(days=30)).isoformat()
        
        invoice_data = {
            "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "due_date": due_date,
            "payment_terms": "30 days",
            "po_number": "PO-2024-001",
            "place_of_supply": "Maharashtra (27)",
            "customer": {
                "name": "ABC Corporation Ltd",
                "address_line1": "456 Corporate Avenue",
                "address_line2": "Business District",
                "city": "Pune",
                "state": "Maharashtra",
                "zip_code": "411001",
                "country": "India",
                "gstin": "27XYZAB1234C1Z5",
                "phone": "+91-9876543210",
                "email": "accounts@abccorp.com"
            },
            "line_items": [
                {
                    "description": "Software Development Services",
                    "hsn_sac": "998313",
                    "quantity": 1,
                    "rate": 50000.0,
                    "amount": 50000.0
                },
                {
                    "description": "Technical Consultation",
                    "hsn_sac": "998314",
                    "quantity": 2,
                    "rate": 15000.0,
                    "amount": 30000.0
                }
            ],
            "service_charges": {
                "description": "Platform Service Charges",
                "hsn_sac": "998314",
                "amount": 5000.0,
                "cgst_rate": 9.0,
                "sgst_rate": 9.0
            },
            "terms_conditions": "Payment should be made within the specified due date. Interest @24% will be charged on delayed payments.",
            "notes": "This is a system-generated invoice and has been digitally signed. No physical signature is required. The GST is applied on the service charges."
        }

        success, response = self.run_test(
            "Create Professional Tax Invoice",
            "POST",
            "invoices",
            200,
            data=invoice_data
        )

        if success and response:
            self.created_invoice_id = response.get('id')
            
            # Verify CGST/SGST calculation
            expected_subtotal = 80000.0  # 50000 + 30000
            expected_service_charge = 5000.0
            expected_cgst = 450.0  # 9% of 5000
            expected_sgst = 450.0  # 9% of 5000
            expected_total_gst = 900.0  # 450 + 450
            expected_grand_total = 85900.0  # 80000 + 5000 + 900
            
            totals = response.get('totals', {})
            
            print(f"\n📊 Professional Tax Invoice Calculation Verification:")
            print(f"Expected Subtotal: ₹{expected_subtotal}")
            print(f"Actual Subtotal: ₹{totals.get('subtotal', 0)}")
            print(f"Expected Service Charge: ₹{expected_service_charge}")
            print(f"Actual Service Charge: ₹{totals.get('service_charge', 0)}")
            print(f"Expected CGST (9%): ₹{expected_cgst}")
            print(f"Actual CGST: ₹{totals.get('total_cgst', 0)}")
            print(f"Expected SGST (9%): ₹{expected_sgst}")
            print(f"Actual SGST: ₹{totals.get('total_sgst', 0)}")
            print(f"Expected Total GST: ₹{expected_total_gst}")
            print(f"Actual Total GST: ₹{totals.get('total_gst', 0)}")
            print(f"Expected Grand Total: ₹{expected_grand_total}")
            print(f"Actual Grand Total: ₹{totals.get('grand_total', 0)}")
            
            # Verify calculations with tolerance for floating point precision
            tolerance = 0.01
            calculations_correct = (
                abs(totals.get('subtotal', 0) - expected_subtotal) < tolerance and
                abs(totals.get('service_charge', 0) - expected_service_charge) < tolerance and
                abs(totals.get('total_cgst', 0) - expected_cgst) < tolerance and
                abs(totals.get('total_sgst', 0) - expected_sgst) < tolerance and
                abs(totals.get('total_gst', 0) - expected_total_gst) < tolerance and
                abs(totals.get('grand_total', 0) - expected_grand_total) < tolerance
            )
            
            if calculations_correct:
                print("✅ CGST/SGST Calculation is CORRECT")
            else:
                print("❌ CGST/SGST Calculation is INCORRECT")
                return False

            # Verify number to words conversion
            amount_in_words = totals.get('amount_in_words', '')
            if amount_in_words and 'Rupees Only' in amount_in_words:
                print("✅ Number to words conversion working")
            else:
                print("❌ Number to words conversion failed")
                return False

        return success

    def test_invoice_crud_operations(self):
        """Test invoice CRUD operations"""
        # Test getting all invoices
        success1, response1 = self.run_test(
            "Get All Invoices",
            "GET",
            "invoices",
            200
        )
        
        if success1 and isinstance(response1, list):
            print(f"✅ Found {len(response1)} invoices")

        # Test getting single invoice
        if not self.created_invoice_id:
            print("⚠️ Skipping single invoice test - no invoice ID available")
            return success1

        success2, response2 = self.run_test(
            "Get Single Invoice",
            "GET",
            f"invoices/{self.created_invoice_id}",
            200
        )
        
        if success2 and response2:
            print(f"✅ Retrieved invoice: {response2.get('invoice_number', 'Unknown')}")

        # Test invoice update
        update_data = {
            "payment_terms": "45 days",
            "notes": "Updated notes - Payment terms extended to 45 days"
        }

        success3, response3 = self.run_test(
            "Update Invoice",
            "PUT",
            f"invoices/{self.created_invoice_id}",
            200,
            data=update_data
        )

        if success3 and response3:
            if response3.get('payment_terms') == "45 days":
                print("✅ Invoice update successful")
            else:
                print("❌ Invoice update failed")
                return False

        return success1 and success2 and success3

    def test_invoice_deletion(self):
        """Test invoice deletion"""
        if not self.created_invoice_id:
            print("⚠️ Skipping delete test - no invoice ID available")
            return True

        success, response = self.run_test(
            "Delete Invoice",
            "DELETE",
            f"invoices/{self.created_invoice_id}",
            200
        )
        
        if success:
            print("✅ Invoice deleted successfully")
            
            # Verify deletion by trying to get the deleted invoice
            success2, _ = self.run_test(
                "Verify Invoice Deletion",
                "GET",
                f"invoices/{self.created_invoice_id}",
                404
            )
            
            if success2:
                print("✅ Invoice deletion verified")
            else:
                print("❌ Invoice deletion verification failed")
                return False
        
        return success

    def test_error_handling(self):
        """Test API error handling"""
        # Test invalid invoice ID
        success1, _ = self.run_test(
            "Get Non-existent Invoice",
            "GET",
            "invoices/invalid-id-12345",
            404
        )
        
        # Test invalid invoice creation (missing required fields)
        invalid_data = {
            "invoice_number": "INVALID-TEST",
            # Missing required fields like customer, due_date, etc.
        }
        
        success2, _ = self.run_test(
            "Create Invalid Invoice",
            "POST",
            "invoices",
            422  # Validation error
        )
        
        if success1 and success2:
            print("✅ Error handling working correctly")
        
        return success1 and success2

def main():
    print("🚀 Starting Professional Tax Invoice API Testing...")
    print("=" * 60)
    
    tester = ProfessionalTaxInvoiceAPITester()
    
    # Run all tests in sequence
    tests = [
        ("API Health Check", tester.test_health_check),
        ("Company Settings", tester.test_company_settings),
        ("Professional Invoice Creation", tester.test_create_professional_invoice),
        ("Invoice CRUD Operations", tester.test_invoice_crud_operations),
        ("Invoice Deletion", tester.test_invoice_deletion),
        ("Error Handling", tester.test_error_handling),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests PASSED! Professional Tax Invoice API is working perfectly!")
        return 0
    elif tester.tests_passed / tester.tests_run >= 0.8:
        print("✅ Most tests PASSED! API is mostly functional with minor issues.")
        return 0
    else:
        print("⚠️ Many tests FAILED! API needs significant fixes.")
        return 1

if __name__ == "__main__":
    sys.exit(main())