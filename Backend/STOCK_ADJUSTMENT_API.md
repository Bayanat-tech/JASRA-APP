# Stock Adjustment API Documentation

## Overview
This API provides endpoints for managing stock adjustments in the WMS (Warehouse Management System). It allows creating, reading, updating, and deleting stock adjustment records in the `TA_ADJDETAIL` table.

## Base URL
```
/api/wms/stock-adjustment
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.

## Endpoints

### 1. Create Stock Adjustment
Creates a new stock adjustment record.

**Endpoint:** `POST /api/wms/stock-adjustment`

**Request Body:**
```json
{
  "JOB_NO": "JOB001",
  "QTY_PUOM": 100.50,
  "QTY_LUOM": 50.25,
  "ADJ_TYPE": "INCREASE"
}
```

**Request Fields:**
- `JOB_NO` (string, required): Job number for the adjustment
- `QTY_PUOM` (number, optional): Quantity in primary unit of measure
- `QTY_LUOM` (number, optional): Quantity in lower unit of measure
- `ADJ_TYPE` (string, optional): Type of adjustment (e.g., "INCREASE", "DECREASE")

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Stock adjustment created successfully",
  "data": {
    "JOB_NO": "JOB001",
    "QTY_PUOM": 100.50,
    "QTY_LUOM": 50.25,
    "ADJ_TYPE": "INCREASE",
    "COMPANY_CODE": "COMP01",
    "CREATED_BY": "user123",
    "UPDATED_BY": "user123",
    "CREATED_AT": "2025-11-24T10:30:00.000Z",
    "UPDATED_AT": "2025-11-24T10:30:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "JOB_NO is required"
}
```

**Response (Error - 409):**
```json
{
  "success": false,
  "message": "Stock adjustment already exists for this JOB_NO"
}
```

---

### 2. Get All Stock Adjustments
Retrieves all stock adjustments for the authenticated user's company.

**Endpoint:** `GET /api/wms/stock-adjustment`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "JOB_NO": "JOB001",
      "QTY_PUOM": 100.50,
      "QTY_LUOM": 50.25,
      "ADJ_TYPE": "INCREASE",
      "COMPANY_CODE": "COMP01",
      "CREATED_BY": "user123",
      "UPDATED_BY": "user123",
      "CREATED_AT": "2025-11-24T10:30:00.000Z",
      "UPDATED_AT": "2025-11-24T10:30:00.000Z"
    }
  ],
  "totalCount": 1
}
```

---

### 3. Get Stock Adjustment by Job Number
Retrieves a specific stock adjustment by job number.

**Endpoint:** `GET /api/wms/stock-adjustment/:JOB_NO`

**URL Parameters:**
- `JOB_NO` (string, required): Job number to retrieve

**Example:** `GET /api/wms/stock-adjustment/JOB001`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "JOB_NO": "JOB001",
    "QTY_PUOM": 100.50,
    "QTY_LUOM": 50.25,
    "ADJ_TYPE": "INCREASE",
    "COMPANY_CODE": "COMP01",
    "CREATED_BY": "user123",
    "UPDATED_BY": "user456",
    "CREATED_AT": "2025-11-24T10:30:00.000Z",
    "UPDATED_AT": "2025-11-24T11:00:00.000Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Stock adjustment not found"
}
```

---

### 4. Update Stock Adjustment
Updates an existing stock adjustment record.

**Endpoint:** `PUT /api/wms/stock-adjustment/:JOB_NO`

**URL Parameters:**
- `JOB_NO` (string, required): Job number to update

**Request Body:**
```json
{
  "QTY_PUOM": 150.75,
  "QTY_LUOM": 75.50,
  "ADJ_TYPE": "DECREASE"
}
```

**Request Fields:**
- `QTY_PUOM` (number, optional): Updated quantity in primary unit of measure
- `QTY_LUOM` (number, optional): Updated quantity in lower unit of measure
- `ADJ_TYPE` (string, optional): Updated type of adjustment

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Stock adjustment updated successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Stock adjustment not found"
}
```

---

### 5. Delete Stock Adjustment
Deletes a stock adjustment record.

**Endpoint:** `DELETE /api/wms/stock-adjustment/:JOB_NO`

**URL Parameters:**
- `JOB_NO` (string, required): Job number to delete

**Example:** `DELETE /api/wms/stock-adjustment/JOB001`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Stock adjustment deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Stock adjustment not found"
}
```

---

## Error Responses

### 400 Bad Request
Returned when required parameters are missing or invalid.

### 401 Unauthorized
Returned when authentication fails or token is invalid.

### 404 Not Found
Returned when the requested resource doesn't exist.

### 409 Conflict
Returned when trying to create a duplicate record.

### 500 Internal Server Error
Returned when an unexpected server error occurs.

```json
{
  "success": false,
  "message": "Failed to create stock adjustment",
  "error": "Detailed error message"
}
```

---

## Database Schema

**Table Name:** `TA_ADJDETAIL`

| Column Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| JOB_NO | VARCHAR2(20) | No | Primary Key - Job number |
| QTY_PUOM | NUMBER(18,4) | Yes | Quantity in primary UOM |
| QTY_LUOM | NUMBER(18,4) | Yes | Quantity in lower UOM |
| ADJ_TYPE | VARCHAR2(10) | Yes | Type of adjustment |
| COMPANY_CODE | VARCHAR2(30) | No | Company identifier |
| CREATED_BY | VARCHAR2(50) | Yes | User who created the record |
| UPDATED_BY | VARCHAR2(50) | Yes | User who last updated |
| CREATED_AT | TIMESTAMP | No | Creation timestamp |
| UPDATED_AT | TIMESTAMP | No | Last update timestamp |

---

## Example Usage with cURL

### Create Stock Adjustment
```bash
curl -X POST http://localhost:3500/api/wms/stock-adjustment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "JOB_NO": "JOB001",
    "QTY_PUOM": 100.50,
    "QTY_LUOM": 50.25,
    "ADJ_TYPE": "INCREASE"
  }'
```

### Get All Adjustments
```bash
curl -X GET http://localhost:3500/api/wms/stock-adjustment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get by Job Number
```bash
curl -X GET http://localhost:3500/api/wms/stock-adjustment/JOB001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Adjustment
```bash
curl -X PUT http://localhost:3500/api/wms/stock-adjustment/JOB001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "QTY_PUOM": 150.75,
    "QTY_LUOM": 75.50,
    "ADJ_TYPE": "DECREASE"
  }'
```

### Delete Adjustment
```bash
curl -X DELETE http://localhost:3500/api/wms/stock-adjustment/JOB001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes
- All fields in the database table are in CAPITAL LETTERS as required
- The API automatically sets `COMPANY_CODE` from the authenticated user's context
- `CREATED_BY` and `UPDATED_BY` are automatically populated from the authenticated user
- Timestamps are automatically managed by the system
- The `JOB_NO` must be unique per company
