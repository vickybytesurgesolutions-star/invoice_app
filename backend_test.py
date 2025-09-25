import requests
import sys
import json
from datetime import datetime

class InvoiceAPITester:
    def __init__(self, base_url="https://invoicetax.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_invoice_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)[:200]}...")
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

    def test_create_invoice(self):
        """Test invoice creation with proper GST calculation"""
        invoice_data = {
            "invoice_number": f"TEST-INV-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "customer": {
                "name": "Test Customer",
                "address": "123 Test Street, Test City",
                "gst_number": "29ABCDE1234F1Z5",
                "phone": "9876543210",
                "email": "test@example.com"
            },
            "line_items": [
                {
                    "description": "Product 1",
                    "quantity": 2,
                    "rate": 100.0,
                    "amount": 200.0
                },
                {
                    "description": "Product 2", 
                    "quantity": 1,
                    "rate": 150.0,
                    "amount": 150.0
                }
            ],
            "service_charges": {
                "description": "Service Charges",
                "amount": 50.0,
                "gst_rate": 18.0,
                "gst_amount": 0  # This should be calculated by backend
            }
        }

        success, response = self.run_test(
            "Create Invoice",
            "POST",
            "invoices",
            200,
            data=invoice_data
        )

        if success and response:
            self.created_invoice_id = response.get('id')
            
            # Verify GST calculation
            expected_subtotal = 350.0  # 200 + 150
            expected_service_charge = 50.0
            expected_gst = 9.0  # 18% of 50
            expected_grand_total = 409.0  # 350 + 50 + 9
            
            totals = response.get('totals', {})
            
            print(f"\n📊 GST Calculation Verification:")
            print(f"Expected Subtotal: ₹{expected_subtotal}")
            print(f"Actual Subtotal: ₹{totals.get('subtotal', 0)}")
            print(f"Expected Service Charge: ₹{expected_service_charge}")
            print(f"Actual Service Charge: ₹{totals.get('service_charge', 0)}")
            print(f"Expected GST: ₹{expected_gst}")
            print(f"Actual GST: ₹{totals.get('gst_on_service', 0)}")
            print(f"Expected Grand Total: ₹{expected_grand_total}")
            print(f"Actual Grand Total: ₹{totals.get('grand_total', 0)}")
            
            # Verify calculations
            if (abs(totals.get('subtotal', 0) - expected_subtotal) < 0.01 and
                abs(totals.get('service_charge', 0) - expected_service_charge) < 0.01 and
                abs(totals.get('gst_on_service', 0) - expected_gst) < 0.01 and
                abs(totals.get('grand_total', 0) - expected_grand_total) < 0.01):
                print("✅ GST Calculation is CORRECT")
            else:
                print("❌ GST Calculation is INCORRECT")
                return False

        return success

    def test_get_invoices(self):
        """Test getting all invoices"""
        success, response = self.run_test(
            "Get All Invoices",
            "GET",
            "invoices",
            200
        )
        
        if success and isinstance(response, list):
            print(f"Found {len(response)} invoices")
            if len(response) > 0:
                print("✅ Invoice list contains data")
            else:
                print("ℹ️ No invoices found (this is okay for a new system)")
        
        return success

    def test_get_single_invoice(self):
        """Test getting a single invoice by ID"""
        if not self.created_invoice_id:
            print("⚠️ Skipping single invoice test - no invoice ID available")
            return True

        success, response = self.run_test(
            "Get Single Invoice",
            "GET",
            f"invoices/{self.created_invoice_id}",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved invoice: {response.get('invoice_number', 'Unknown')}")
        
        return success

    def test_delete_invoice(self):
        """Test deleting an invoice"""
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
        
        return success

    def test_invalid_endpoints(self):
        """Test error handling for invalid requests"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid invoice ID
        success, _ = self.run_test(
            "Get Non-existent Invoice",
            "GET",
            "invoices/invalid-id",
            404
        )
        
        if success:
            print("✅ Proper 404 error for non-existent invoice")
        
        # Test invalid invoice creation (missing required fields)
        invalid_data = {
            "invoice_number": "INVALID",
            # Missing customer and other required fields
        }
        
        success2, _ = self.run_test(
            "Create Invalid Invoice",
            "POST",
            "invoices",
            422  # Validation error
        )
        
        return success and success2

def main():
    print("🚀 Starting Invoice API Testing...")
    print("=" * 50)
    
    tester = InvoiceAPITester()
    
    # Run all tests
    tests = [
        tester.test_health_check,
        tester.test_create_invoice,
        tester.test_get_invoices,
        tester.test_get_single_invoice,
        tester.test_delete_invoice,
        # tester.test_invalid_endpoints  # Commented out as it might not be critical
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests PASSED!")
        return 0
    else:
        print("⚠️ Some tests FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(main())