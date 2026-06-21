# Add Receiving Details API Documentation

## Overview
This API allows you to update the receiving quantities (`qty1_arrived` and `qty2_arrived`) for a specific packing detail in the WMS inbound system.

## Endpoint
```
PUT /api/wms/inbound/packing_details/receiving
```

## Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`

## Query Parameters
All query parameters are **required**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `prin_code` | string | Principal code | "10005" |
| `job_no` | string | Job number | "IB25060068" |
| `packdet_no` | number | Packing detail number | 1680 |

## Request Body
At least one of the following fields must be provided:

```json
{
  "qty1_arrived": 123,
  "qty2_arrived": 50
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `qty1_arrived` | number | Optional* | First quantity arrived |
| `qty2_arrived` | number | Optional* | Second quantity arrived |

*At least one of these fields must be provided.

## Example Request

### Full URL
```
PUT /api/wms/inbound/packing_details/receiving?prin_code=10005&job_no=IB25060068&packdet_no=1680
```

### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body
```json
{
  "qty1_arrived": 123,
  "qty2_arrived": 50
}
```

### cURL Example
```bash
curl -X PUT "http://localhost:3500/api/wms/inbound/packing_details/receiving?prin_code=10005&job_no=IB25060068&packdet_no=1680" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qty1_arrived": 123,
    "qty2_arrived": 50
  }'
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Receiving Details updated successfully",
  "data": {
    "QTY_ARRIVED_STRING": null,
    "QTY_STRING": "123 CSE",
    "COMPANY_CODE": "BSG",
    "PRIN_CODE": "10005",
    "BATCH_NO": null,
    "JOB_NO": "IB25060068",
    "PACKDET_NO": 1680,
    "PROD_CODE": "106887",
    "UPPP": 1,
    "QTY_PUOM": 123,
    "P_UOM": "CSE",
    "QTY_LUOM": 0,
    "L_UOM": "CSE",
    "QUANTITY": 123,
    "CONTAINER_NO": "DAF",
    "PO_NO": "FDDAS",
    "ALLOCATED": "N",
    "CLEARANCE": "N",
    "MFG_DATE": "1899-12-31T18:38:50.000Z",
    "EXP_DATE": "3000-12-30T18:30:00.000Z",
    "qty1_arrived": 123,
    "qty2_arrived": 50,
    "PROD_NAME": "SADIA CHICKEN BREAST SMALL CUBES 10 X 750g"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Query Parameters
```json
{
  "success": false,
  "message": "prin_code, job_no, and packdet_no are required"
}
```

#### 400 Bad Request - Missing Body Data
```json
{
  "success": false,
  "message": "At least one of qty1_arrived or qty2_arrived must be provided"
}
```

#### 404 Not Found - Packing Details Not Found
```json
{
  "success": false,
  "message": "Packing Details not found"
}
```

#### 500 Internal Server Error - Update Failed
```json
{
  "success": false,
  "message": "Failed to update receiving details"
}
```

## Database Table
- **Table**: `TI_PACKDET`
- **Columns Updated**: 
  - `qty1_arrived` (NUMBER(12,1))
  - `qty2_arrived` (NUMBER(12,1))

## Composite Key
The packing detail record is identified by:
- `company_code` (from authenticated user)
- `prin_code` (from query parameter)
- `job_no` (from query parameter)
- `packdet_no` (from query parameter)

## Business Logic
1. Validates that all required query parameters are provided
2. Validates that at least one quantity field is provided in the request body
3. Checks if the packing detail exists with the given composite key
4. Updates only the provided quantity fields (`qty1_arrived` and/or `qty2_arrived`)
5. Returns the updated packing detail record

## Notes
- The `company_code` is automatically taken from the authenticated user's session
- Both quantities are optional, but at least one must be provided
- The API performs a partial update - only provided fields are updated
- The updated record is returned in the response for immediate verification

## Testing
Use tools like Postman, Insomnia, or cURL to test the API with your JWT token and the required parameters from your packing detail creation response.
