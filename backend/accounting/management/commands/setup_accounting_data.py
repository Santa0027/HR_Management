from django.core.management.base import BaseCommand
from accounting.models import AccountingCategory, PaymentMethod, BankAccount
from company.models import Company


class Command(BaseCommand):
    help = 'Setup initial accounting data (categories, payment methods, etc.)'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial accounting data...')
        
        # Create Income Categories
        income_categories = [
            ('Driver Commission', 'Commission earned from driver services'),
            ('Company Payment', 'Payments received from companies'),
            ('Vehicle Rental', 'Income from vehicle rental services'),
            ('Service Fee', 'Service fees charged to clients'),
            ('Penalty Collection', 'Penalties collected from drivers'),
            ('Late Fee', 'Late fees charged'),
            ('Registration Fee', 'Registration fees from new drivers'),
            ('Other Income', 'Miscellaneous income'),
        ]
        
        for name, description in income_categories:
            category, created = AccountingCategory.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'category_type': 'income',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created income category: {name}')
        
        # Create Expense Categories
        expense_categories = [
            ('Driver Salary', 'Salaries paid to drivers'),
            ('Driver Allowance', 'Allowances paid to drivers'),
            ('Vehicle Maintenance', 'Vehicle maintenance and repairs'),
            ('Fuel', 'Fuel expenses'),
            ('Insurance', 'Insurance premiums'),
            ('Accommodation', 'Driver accommodation expenses'),
            ('Phone Bill', 'Phone bill expenses'),
            ('Office Rent', 'Office rental expenses'),
            ('Utilities', 'Electricity, water, internet bills'),
            ('Marketing', 'Marketing and advertising expenses'),
            ('Legal Fees', 'Legal and professional fees'),
            ('Bank Charges', 'Bank transaction charges'),
            ('Office Supplies', 'Office supplies and equipment'),
            ('Travel Expenses', 'Business travel expenses'),
            ('Other Expenses', 'Miscellaneous expenses'),
        ]
        
        for name, description in expense_categories:
            category, created = AccountingCategory.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'category_type': 'expense',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created expense category: {name}')
        
        # Create Payment Methods
        payment_methods = [
            ('Cash', 'Cash payments'),
            ('Bank Transfer', 'Bank wire transfers'),
            ('Credit Card', 'Credit card payments'),
            ('Debit Card', 'Debit card payments'),
            ('Check', 'Check payments'),
            ('Mobile Payment', 'Mobile payment apps'),
            ('Online Banking', 'Online banking transfers'),
            ('PayPal', 'PayPal payments'),
            ('Other', 'Other payment methods'),
        ]
        
        for name, description in payment_methods:
            method, created = PaymentMethod.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created payment method: {name}')
        
        # Create sample bank accounts for existing companies
        companies = Company.objects.all()
        for company in companies:
            # Check if company already has bank accounts
            if not company.bank_accounts.exists():
                bank_account, created = BankAccount.objects.get_or_create(
                    account_number=f"ACC{company.id:04d}001",
                    defaults={
                        'account_name': f"{company.company_name} - Main Account",
                        'bank_name': company.bank_name if hasattr(company, 'bank_name') and company.bank_name else 'Default Bank',
                        'account_type': 'business',
                        'balance': 0.00,
                        'currency': 'USD',
                        'company': company,
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(f'Created bank account for company: {company.company_name}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully set up initial accounting data!')
        )
