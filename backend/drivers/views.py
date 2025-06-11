from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def driver_list(request):
    data = {
        "drivers": [
            {"id": 1, "name": "Santhosh", "phone": "9876543210"},
            {"id": 2, "name": "Rahul", "phone": "9876509876"},
        ]
    }
    return Response(data)
