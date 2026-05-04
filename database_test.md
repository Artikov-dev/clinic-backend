# Database Connection Test Report

**Generated**: 2026-05-02T12:33:10.046Z

## Connection Status
- **Status**: ✅ CONNECTED
- **Database URL**: `postgresql://clinic:***@dpg-d7q8ut77f7vs73cpi4ng-a.virginia-postgres.render.com/forclinic`

## Database Information
- **Database Name**: `forclinic`
- **User**: `clinic`
- **PostgreSQL Version**: PostgreSQL 18.3 (Debian 18.3-1.pgdg12+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit

## Tables (8 found)

### roles
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | No |
| created_at | timestamp without time zone | Yes |
| name | character varying | No |

### users
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | No |
| role_id | uuid | No |
| created_at | timestamp without time zone | Yes |
| full_name | character varying | No |
| email | character varying | No |
| password | character varying | No |

### appointments
| Column | Type | Nullable |
|--------|------|----------|
| appointment_date | timestamp without time zone | No |
| patient_id | uuid | No |
| doctor_id | uuid | No |
| id | uuid | No |
| updated_at | timestamp without time zone | Yes |
| created_at | timestamp without time zone | Yes |
| status | character varying | No |

### medical_records
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | No |
| patient_id | uuid | No |
| doctor_id | uuid | No |
| created_at | timestamp without time zone | Yes |
| updated_at | timestamp without time zone | Yes |
| notes | text | No |

### prescriptions
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | No |
| appointment_id | uuid | No |
| doctor_id | uuid | No |
| patient_id | uuid | No |
| created_at | timestamp without time zone | Yes |
| dosage | character varying | No |
| instructions | text | Yes |
| medicine_name | character varying | No |

### payments
| Column | Type | Nullable |
|--------|------|----------|
| amount | numeric | No |
| appointment_id | uuid | No |
| patient_id | uuid | No |
| id | uuid | No |
| updated_at | timestamp without time zone | Yes |
| created_at | timestamp without time zone | Yes |
| status | character varying | No |

### appointment_details
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | Yes |
| appointment_date | timestamp without time zone | Yes |
| created_at | timestamp without time zone | Yes |
| patient_name | character varying | Yes |
| doctor_name | character varying | Yes |
| status | character varying | Yes |

### payment_details
| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | Yes |
| amount | numeric | Yes |
| created_at | timestamp without time zone | Yes |
| patient_name | character varying | Yes |
| status | character varying | Yes |


## Test Results


✅ **All tests passed successfully!**
- Database is accessible and responding
- 8 table(s) detected
- Query execution working properly


## Errors
No errors

---
*Test completed at 5/2/2026, 5:33:13 PM*
