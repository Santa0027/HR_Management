from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date
from hr.models import (
    Employee, LeaveType, LeaveBalance, Company
)
from company.models import Company as CompanyModel

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up initial HR data including leave types and employee profiles'

    def handle(self, *args, **options):
        self.stdout.write('Setting up HR data...')
        
        # Create default leave types
        leave_types_data = [
            {
                'name': 'Annual Leave',
                'description': 'Yearly vacation leave',
                'max_days_per_year': 21,
                'is_paid': True,
                'requires_approval': True
            },
            {
                'name': 'Sick Leave',
                'description': 'Medical leave for illness',
                'max_days_per_year': 10,
                'is_paid': True,
                'requires_approval': False
            },
            {
                'name': 'Personal Leave',
                'description': 'Personal time off',
                'max_days_per_year': 5,
                'is_paid': False,
                'requires_approval': True
            },
            {
                'name': 'Maternity Leave',
                'description': 'Maternity leave for new mothers',
                'max_days_per_year': 90,
                'is_paid': True,
                'requires_approval': True
            },
            {
                'name': 'Paternity Leave',
                'description': 'Paternity leave for new fathers',
                'max_days_per_year': 15,
                'is_paid': True,
                'requires_approval': True
            },
            {
                'name': 'Emergency Leave',
                'description': 'Emergency family situations',
                'max_days_per_year': 3,
                'is_paid': True,
                'requires_approval': False
            }
        ]
        
        created_leave_types = 0
        for leave_data in leave_types_data:
            leave_type, created = LeaveType.objects.get_or_create(
                name=leave_data['name'],
                defaults=leave_data
            )
            if created:
                created_leave_types += 1
                self.stdout.write(f'Created leave type: {leave_type.name}')
        
        self.stdout.write(f'Created {created_leave_types} leave types')
        
        # Create employee profiles for existing users
        created_employees = 0
        updated_employees = 0
        
        # Get or create a default company
        try:
            default_company = CompanyModel.objects.first()
            if not default_company:
                default_company = CompanyModel.objects.create(
                    company_name='Default Company',
                    company_address='Default Address',
                    company_phone='0000000000',
                    company_email='default@company.com'
                )
                self.stdout.write('Created default company')
        except Exception as e:
            self.stdout.write(f'Error with company: {e}')
            # Create a simple company if the model structure is different
            default_company = None
        
        for user in User.objects.all():
            if not hasattr(user, 'employee_profile'):
                try:
                    # Generate employee ID
                    employee_count = Employee.objects.count()
                    employee_id = f'EMP{str(employee_count + 1).zfill(4)}'
                    
                    employee_data = {
                        'user': user,
                        'employee_id': employee_id,
                        'first_name': user.first_name or 'First',
                        'last_name': user.last_name or 'Last',
                        'email': user.email,
                        'phone': '0000000000',
                        'position': self.get_position_by_role(user.role),
                        'department': self.get_department_by_role(user.role),
                        'hire_date': getattr(user, 'created_at', timezone.now()).date() if hasattr(user, 'created_at') else date(2025, 1, 1),
                        'employment_type': 'full_time',
                        'employment_status': 'active',
                        'company': default_company
                    }
                    
                    employee = Employee.objects.create(**employee_data)
                    created_employees += 1
                    self.stdout.write(f'Created employee profile for: {user.email}')
                    
                    # Create leave balances for the employee
                    self.create_leave_balances(employee)
                    
                except Exception as e:
                    self.stdout.write(f'Error creating employee for {user.email}: {e}')
            else:
                # Update existing employee
                employee = user.employee_profile
                if not employee.employee_id:
                    employee_count = Employee.objects.count()
                    employee.employee_id = f'EMP{str(employee_count + 1).zfill(4)}'
                if not employee.position:
                    employee.position = self.get_position_by_role(user.role)
                if not employee.department:
                    employee.department = self.get_department_by_role(user.role)
                employee.save()
                updated_employees += 1
                self.stdout.write(f'Updated employee profile for: {user.email}')
        
        self.stdout.write(f'Created {created_employees} employee profiles')
        self.stdout.write(f'Updated {updated_employees} employee profiles')
        
        self.stdout.write(self.style.SUCCESS('HR data setup completed successfully!'))
    
    def get_position_by_role(self, role):
        position_mapping = {
            'admin': 'System Administrator',
            'hr': 'HR Manager',
            'accountant': 'Accountant',
            'driver': 'Driver',
            'management': 'Manager',
            'staff': 'Staff Member'
        }
        return position_mapping.get(role, 'Employee')
    
    def get_department_by_role(self, role):
        department_mapping = {
            'admin': 'IT',
            'hr': 'Human Resources',
            'accountant': 'Finance',
            'driver': 'Operations',
            'management': 'Management',
            'staff': 'General'
        }
        return department_mapping.get(role, 'General')
    
    def create_leave_balances(self, employee):
        """Create leave balances for an employee"""
        from datetime import datetime
        current_year = datetime.now().year
        
        leave_allocations = {
            'Annual Leave': 21,
            'Sick Leave': 10,
            'Personal Leave': 5,
            'Emergency Leave': 3
        }
        
        for leave_type_name, allocated_days in leave_allocations.items():
            try:
                leave_type = LeaveType.objects.get(name=leave_type_name)
                LeaveBalance.objects.get_or_create(
                    employee=employee,
                    leave_type=leave_type,
                    year=current_year,
                    defaults={
                        'allocated_days': allocated_days,
                        'used_days': 0,
                        'pending_days': 0
                    }
                )
            except LeaveType.DoesNotExist:
                continue
