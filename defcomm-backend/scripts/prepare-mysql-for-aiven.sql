-- ============================================================================
-- Aiven Migration: Local MySQL Preparation Script
-- ============================================================================
-- Run this script to grant replication privileges and verify configuration
-- 
-- Usage:
--   mysql -u root -p < scripts/prepare-mysql-for-aiven.sql
-- ============================================================================

-- Create root user for remote access if it doesn't exist (MySQL 8.0+ requirement)
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'tiger123';

-- Grant replication privileges to root user for Aiven migration
GRANT REPLICATION CLIENT ON *.* TO 'root'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- Verify GTID is enabled
SELECT '=== Checking GTID Configuration ===' AS '';
SHOW VARIABLES LIKE 'gtid_mode';
SHOW VARIABLES LIKE 'enforce_gtid_consistency';

-- Verify binary logging is enabled
SELECT '=== Checking Binary Logging ===' AS '';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';

-- Verify server configuration
SELECT '=== Checking Server Configuration ===' AS '';
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'bind_address';

-- Show current databases
SELECT '=== Current Databases ===' AS '';
SHOW DATABASES;

-- Show defcomm database tables and row counts
SELECT '=== DefComm Database Statistics ===' AS '';
USE defcomm;
SHOW TABLES;

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'groups' AS table_name, COUNT(*) AS row_count FROM `groups`
UNION ALL
SELECT 'group_members' AS table_name, COUNT(*) AS row_count FROM group_members
UNION ALL
SELECT 'messages' AS table_name, COUNT(*) AS row_count FROM messages;

-- Show current grants for root user
SELECT '=== Current Grants for root@% ===' AS '';
SHOW GRANTS FOR 'root'@'%';

SELECT '=== Configuration Check Complete ===' AS '';
SELECT 'If gtid_mode = ON and log_bin = ON, you are ready for Aiven migration!' AS status;
