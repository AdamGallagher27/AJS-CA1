# CA1 API Docs Adam Gallagher

## Scripts
- **`dev`**: Starts the server in development mode with automatic restarts
- **`test`**: Changes environment to testing and runs jest

## Resource Routes
- **`/api/hospitals`**
- **`/api/rooms`**
- **`/api/surgeries`**
- **`/api/patients`**
- **`/api/workers`**
-  **`/api/users`**

Users resource only has three end points
-  **`/users/register`**
-  **`/users/login`**
-  **`/users/makeAdmin?userid=[userid]`**

The other resources have these and they all follow the same naming convention
- **`GET /api/resource`** get all resources
- **`GET /api/resource`** get one resource by id
- **`GET /api/resource/MyResource/read`** get all resources created by user 
- **`POST /api/resource`** create resource
- **`PUT /api/resource`** update resource
- **`DELETE /api/resource`** delete resource


## Models / Params

### Hospital

| Property                     | Type                | Required |
|------------------------------|---------------------|----------|
| `title`                      | String              | Yes      |
| `city`                       | String              | Yes      |
| `daily_rate`                 | Number              | Yes      |
| `number_of_departments`      | Number              | Yes      |
| `has_emergency_services`      | Boolean             | Yes      |
| `rooms`                      | Array of ObjectId   | Yes      |
| `created_by`                 | String              | Yes      |
| `is_deleted`                 | Boolean             | No       |
| `image_path`                 | String              | No       |

### Patient

| Property        | Type                | Required |
|-----------------|---------------------|----------|
| `first_name`    | String              | Yes      |
| `last_name`     | String              | Yes      |
| `insurance`     | Boolean             | Yes      |
| `age`           | Number              | Yes      |
| `condition`     | String              | Yes      |
| `surgeries`     | Array of ObjectId   | Yes      |
| `created_by`    | String              | Yes      |
| `is_deleted`    | Boolean             | No       |

### Room

| Property                | Type                | Required |
|-------------------------|---------------------|----------|
| `room_number`           | Number              | Yes      |
| `room_type`             | String              | Yes      |
| `availability_status`    | Boolean             | Yes      |
| `daily_rate`            | Number              | Yes      |
| `hospital`              | ObjectId            | Yes      |
| `surgeries`             | Array of ObjectId   | Yes      |
| `created_by`            | String              | Yes      |
| `is_deleted`            | Boolean             | No       |

### Surgery

| Property         | Type                | Required |
|------------------|---------------------|----------|
| `surgery_type`   | String              | Yes      |
| `date`           | Date                | Yes      |
| `duration`       | Number              | Yes      |
| `room`           | ObjectId            | Yes      |
| `patient`        | ObjectId            | Yes      |
| `workers`        | Array of ObjectId   | Yes      |
| `created_by`     | String              | Yes      |
| `is_deleted`     | Boolean             | No       |

### Worker

| Property         | Type                | Required |
|------------------|---------------------|----------|
| `worker_role`    | String (enum)       | Yes      |
| `first_name`     | String              | Yes      |
| `last_name`      | String              | Yes      |
| `surgeries`      | Array of ObjectId   | No       |
| `created_by`     | String              | Yes      |
| `is_deleted`     | Boolean             | No       |

### User

| Property      | Type                | Required |
|---------------|---------------------|----------|
| `full_name`   | String              | Yes      |
| `email`       | String              | Yes      |
| `password`    | String              | Yes      |
| `role`        | String (enum)       | No       |
