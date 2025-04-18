# LibSQL Replicated Server with Bottomless Replication

A demonstration project showing how to set up and use:

- LibSQL with an HTTP API for database interactions
- Primary-replica replication between two LibSQL servers
- Bottomless Replication to backup data to MinIO (S3-compatible storage)

## Architecture

This project consists of three main components:

1. **Primary LibSQL Server** - Handles write operations and replicates data to both the replica and MinIO
2. **MinIO Server** - S3-compatible storage for bottomless replication (database backups)

## Prerequisites

- Docker and Docker Compose
- curl (for API requests)
- Bash shell (for initialization script)
- Node.js and npm (for Express server)

## Warning

Looks like `sqld` software is in BETA version - there are many ongoing changes in documentation, commands and options.

This demo was done with version `361d082` of the `libsql-server` image.

## Documentation Resources

- [LibSQL Documentation](https://docs.turso.tech/libsql)
- [LibSQL Server Mode](https://github.com/tursodatabase/libsql/tree/main/libsql-server)
- [LibSQL Client for JavaScript](https://github.com/tursodatabase/libsql-js)
- [Bottomless Replication](https://github.com/tursodatabase/libsql/tree/main/libsql-server#integration-with-s3-bottomless-replication)
- [Bottomless CLI](https://github.com/tursodatabase/libsql/tree/main/bottomless)
- [MinIO Documentation](https://min.io/)

## Project Structure

```filetree
.
├── express-server/          # Express.js based API server
│   ├── index.js             # Server implementation
│   ├── package.json         # Node.js dependencies
├── libsql-server/           # Primary LibSQL server configuration
│   ├── data/                # Database files location
│   ├── docker-compose.yml   # Docker configuration for primary server and MinIO
│   ├── init-db.sh           # Database initialization script
└── README.md                # This file
```

## Setup and Running

### 1. Create the Network

```bash
docker network create libsql-network
```

### 2. Start the Primary Server

```bash
cd libsql-server
docker-compose up
```

This starts:

- The primary LibSQL server on port 8080
- A MinIO server on ports 9000 (API) and 9001 (Console)

### 3. Initialize the Database

```bash
cd libsql-server
./init-db.sh
```

This script creates a `books` table and populates it with sample data.

### Interact with the Express Server

```bash
cd express-server
npm start
```

This starts the Express server on port 3800.

Available routes:

- http://localhost:3800 - this will return a list of available routes.
- http://localhost:3800/server - this will return the list of books from the primary server db.
- http://localhost:3800/server/add - this will add a new book to the primary server db.
- http://localhost:3800/replica - this will return the list of books from the replica db.
- http://localhost:3800/replica/add - this will add a new book to the replica db.
- http://localhost:3800/replica2 - this will return the list of books from the replica db 2.
- http://localhost:3800/replica2/add - this will add a new book to the replica db 2.

### Access MinIO Console

Open [http://localhost:9001](http://localhost:9001) in your browser and log in with:

- Username: `minioadmin`
- Password: `minioadmin`

The `libsql-backups` bucket contains the database backup files.

## Troubleshooting

- **Connection Issues**: Ensure all containers are running with `docker ps`
- **MinIO Issues**: Verify bucket creation with `docker logs create-bucket`

## Shutting Down

```bash
# Stop the primary server and MinIO
cd libsql-server
docker-compose down -v

docker network rm libsql-network
```

## SQL daemon usage

```bash
Usage: sqld [OPTIONS] [COMMAND]

Commands:
  admin-shell  
  help         Print this message or the help of the given subcommand(s)

Options:
  -d, --db-path <DB_PATH>
          [env: SQLD_DB_PATH=/var/lib/sqld/books_replica.db]
          [default: data.sqld]

  -e, --extensions-path <EXTENSIONS_PATH>
          The directory path where trusted extensions can be loaded from. If not present, extension loading is disabled. If present, the directory is expected to have a trusted.lst file containing the sha256 and name of each extension, one per line. Example:
          
          99890762817735984843bf5cf02a4b2ea648018fd05f04df6f9ce7f976841510  math.dylib

      --http-listen-addr <HTTP_LISTEN_ADDR>
          [env: SQLD_HTTP_LISTEN_ADDR=0.0.0.0:8080]
          [default: 127.0.0.1:8080]

      --enable-http-console
          Enable a web-based http console served at the /console route

  -l, --hrana-listen-addr <HRANA_LISTEN_ADDR>
          Address and port for the legacy, Web-Socket-only Hrana server
          
          [env: SQLD_HRANA_LISTEN_ADDR=]

      --admin-listen-addr <ADMIN_LISTEN_ADDR>
          The address and port for the admin HTTP API
          
          [env: SQLD_ADMIN_LISTEN_ADDR=]

      --auth-jwt-key-file <AUTH_JWT_KEY_FILE>
          Path to a file with a JWT decoding key used to authenticate clients in the Hrana and HTTP APIs. The key is either a PKCS#8-encoded Ed25519 public key in PEM, or just plain bytes of the Ed25519 public key in URL-safe base64.
          
          It is possible to provide multiple JWT decoding keys in a single file by concatenating them together. All decoding keys will be tried when parsing incoming JWT's.
          
          You can also pass the key directly in the env variable SQLD_AUTH_JWT_KEY.
          
          [env: SQLD_AUTH_JWT_KEY_FILE=]

      --http-auth <HTTP_AUTH>
          Specifies legacy HTTP basic authentication. The argument must be in format "basic:$PARAM", where $PARAM is base64-encoded string "$USERNAME:$PASSWORD"
          
          [env: SQLD_HTTP_AUTH=basic:dXNlcjpwYXNzd29yZA==]

      --http-self-url <HTTP_SELF_URL>
          URL that points to the HTTP API of this server. If set, this is used to implement "sticky sessions" in Hrana over HTTP
          
          [env: SQLD_HTTP_SELF_URL=]

      --http-primary-url <HTTP_PRIMARY_URL>
          [env: SQLD_HTTP_PRIMARY_URL=]

      --grpc-listen-addr <GRPC_LISTEN_ADDR>
          The address and port the inter-node RPC protocol listens to. Example: `0.0.0.0:5001`
          
          [env: SQLD_GRPC_LISTEN_ADDR=]

      --grpc-tls
          

      --grpc-cert-file <GRPC_CERT_FILE>
          

      --grpc-key-file <GRPC_KEY_FILE>
          

      --grpc-ca-cert-file <GRPC_CA_CERT_FILE>
          

      --primary-grpc-url <PRIMARY_GRPC_URL>
          The gRPC URL of the primary node to connect to for writes. Example: `http://localhost:5001`
          
          [env: SQLD_PRIMARY_GRPC_URL=http://libsql-server:5001]

      --primary-grpc-tls
          

      --primary-grpc-cert-file <PRIMARY_GRPC_CERT_FILE>
          

      --primary-grpc-key-file <PRIMARY_GRPC_KEY_FILE>
          

      --primary-grpc-ca-cert-file <PRIMARY_GRPC_CA_CERT_FILE>
          

      --no-welcome
          Don't display welcome message

      --enable-bottomless-replication
          [env: SQLD_ENABLE_BOTTOMLESS_REPLICATION=]

      --idle-shutdown-timeout-s <IDLE_SHUTDOWN_TIMEOUT_S>
          The duration, in second, after which to shutdown the server if no request have been received. By default, the server doesn't shutdown when idle
          
          [env: SQLD_IDLE_SHUTDOWN_TIMEOUT_S=]

      --initial-idle-shutdown-timeout-s <INITIAL_IDLE_SHUTDOWN_TIMEOUT_S>
          Like idle_shutdown_timeout_s but used only once after the server is started. After that server either is shut down because it does not receive any requests or idle_shutdown_timeout_s is used moving forward
          
          [env: SQLD_INITIAL_IDLE_SHUTDOWN_TIMEOUT_S=]

      --max-log-size <MAX_LOG_SIZE>
          Maximum size the replication log is allowed to grow (in MB). defaults to 200MB
          
          [env: SQLD_MAX_LOG_SIZE=]
          [default: 200]

      --max-log-duration <MAX_LOG_DURATION>
          Maximum duration before the replication log is compacted (in seconds). By default, the log is compacted only if it grows above the limit specified with `--max-log-size`
          
          [env: SQLD_MAX_LOG_DURATION=]

      --heartbeat-url <HEARTBEAT_URL>
          The URL to send a server heartbeat `POST` request to. By default, the server doesn't send a heartbeat
          
          [env: SQLD_HEARTBEAT_URL=]

      --heartbeat-auth <HEARTBEAT_AUTH>
          The HTTP "Authorization" header to include in the a server heartbeat `POST` request. By default, the server doesn't send a heartbeat
          
          [env: SQLD_HEARTBEAT_AUTH=]

      --heartbeat-period-s <HEARTBEAT_PERIOD_S>
          The heartbeat time period in seconds. By default, the the period is 30 seconds
          
          [env: SQLD_HEARTBEAT_PERIOD_S=]
          [default: 30]

      --soft-heap-limit-mb <SOFT_HEAP_LIMIT_MB>
          Soft heap size limit in mebibytes - libSQL will try to not go over this limit with memory usage
          
          [env: SQLD_SOFT_HEAP_LIMIT_MB=]

      --hard-heap-limit-mb <HARD_HEAP_LIMIT_MB>
          Hard heap size limit in mebibytes - libSQL will bail out with SQLITE_NOMEM error if it goes over this limit with memory usage
          
          [env: SQLD_HARD_HEAP_LIMIT_MB=]

      --max-response-size <MAX_RESPONSE_SIZE>
          Set the maximum size for a response. e.g 5KB, 10MB...
          
          [env: SQLD_MAX_RESPONSE_SIZE=]
          [default: 10MB]

      --max-total-response-size <MAX_TOTAL_RESPONSE_SIZE>
          Set the maximum size for all responses. e.g 5KB, 10MB...
          
          [env: SQLD_MAX_TOTAL_RESPONSE_SIZE=]
          [default: 32MB]

      --snapshot-exec <SNAPSHOT_EXEC>
          Set a command to execute when a snapshot file is generated
          
          [env: SQLD_SNAPSHOT_EXEC=]

      --checkpoint-interval-s <CHECKPOINT_INTERVAL_S>
          Interval in seconds, in which WAL checkpoint is being called. By default, the interval is 1 hour
          
          [env: SQLD_CHECKPOINT_INTERVAL_S=]

      --disable-default-namespace
          By default, all request for which a namespace can't be determined fallback to the default namespace `default`. This flag disables that

      --enable-namespaces
          Enable the namespaces features. Namespaces are disabled by default, and all requests target the default namespace

      --snapshot-at-shutdown
          Enable snapshot at shutdown

      --max-active-namespaces <MAX_ACTIVE_NAMESPACES>
          Max active namespaces kept in-memory
          
          [env: SQLD_MAX_ACTIVE_NAMESPACES=]
          [default: 100]

      --backup-meta-store
          Enable backup for the metadata store
          
          [env: SQLD_BACKUP_META_STORE=]

      --meta-store-access-key-id <META_STORE_ACCESS_KEY_ID>
          S3 access key ID for the meta store backup
          
          [env: SQLD_META_STORE_ACCESS_KEY_ID=]

      --meta-store-secret-access-key <META_STORE_SECRET_ACCESS_KEY>
          S3 secret access key for the meta store backup
          
          [env: SQLD_META_STORE_SECRET_ACCESS=]

      --meta-store-session-token <META_STORE_SESSION_TOKEN>
          S3 session token for the meta store backup
          
          [env: SQLD_META_STORE_SESSION_TOKEN=]

      --meta-store-region <META_STORE_REGION>
          S3 region for the metastore backup
          
          [env: SQLD_META_STORE_REGION=]

      --meta-store-backup-id <META_STORE_BACKUP_ID>
          Id for the meta store backup
          
          [env: SQLD_META_STORE_BACKUP_ID=]

      --meta-store-bucket-name <META_STORE_BUCKET_NAME>
          S3 bucket name for the meta store backup
          
          [env: SQLD_META_STORE_BUCKET_NAME=]

      --meta-store-backup-interval-s <META_STORE_BACKUP_INTERVAL_S>
          Interval at which to perform backups of the meta store
          
          [env: SQLD_META_STORE_BACKUP_INTERVAL_S=]

      --meta-store-bucket-endpoint <META_STORE_BUCKET_ENDPOINT>
          S3 endpoint for the meta store backups
          
          [env: SQLD_META_STORE_BUCKET_ENDPOINT=]

      --meta-store-destroy-on-error
          [env: SQLD_META_STORE_DESTROY_ON_ERROR=]

      --encryption-key <ENCRYPTION_KEY>
          encryption_key for encryption at rest
          
          [env: SQLD_ENCRYPTION_KEY=]

      --max-concurrent-connections <MAX_CONCURRENT_CONNECTIONS>
          [env: SQLD_MAX_CONCURRENT_CONNECTIONS=]
          [default: 128]

      --max-concurrent-requests <MAX_CONCURRENT_REQUESTS>
          [env: SQLD_MAX_CONCURRENT_REQUESTS=]
          [default: 128]

      --disable-intelligent-throttling
          [env: SQLD_DISABLE_INTELLIGENT_THROTTLING=]

      --connection-creation-timeout-sec <CONNECTION_CREATION_TIMEOUT_SEC>
          [env: SQLD_CONNECTION_CREATION_TIMEOUT_SEC=]

      --allow-metastore-recovery
          Allow meta store to recover config from filesystem from older version, if meta store is empty on startup
          
          [env: SQLD_ALLOW_METASTORE_RECOVERY=]

      --shutdown-timeout <SHUTDOWN_TIMEOUT>
          Shutdown timeout duration in seconds, defaults to 30 seconds
          
          [env: SQLD_SHUTDOWN_TIMEOUT=]

      --storage-server-address <STORAGE_SERVER_ADDRESS>
          [env: LIBSQL_STORAGE_SERVER_ADDR=]
          [default: http://0.0.0.0:5002]

      --migrate-bottomless
          Enable bottomless to libsql_wal migration. Bottomless replication must be enabled
          
          [env: LIBSQL_MIGRATE_BOTTOMLESS=]

      --enable-deadlock-monitor
          Enables the main runtime deadlock monitor: if the main runtime deadlocks, logs an error

      --admin-auth-key <ADMIN_AUTH_KEY>
          Auth key for the admin API
          
          [env: LIBSQL_ADMIN_AUTH_KEY=]

      --sync-from-storage
          Whether to perform a sync of all namespaces with remote on startup
          
          [env: LIBSQL_SYNC_FROM_STORAGE=]

      --force-load-wals
          Whether to force loading all WAL at startup, with libsql-wal By default, WALs are loaded lazily, as the databases are openned. Whether to force loading all wal at startup

      --sync-conccurency <SYNC_CONCCURENCY>
          Sync conccurency
          
          [env: LIBSQL_SYNC_CONCCURENCY=]
          [default: 8]

      --disable-metrics
          Disable prometheus metrics collection
          
          [env: LIBSQL_DISABLE_METRICS=]

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```
