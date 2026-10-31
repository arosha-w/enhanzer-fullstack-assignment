/* Enhanzer POS - SQL Server script (run in SSMS / sqlcmd) */
IF DB_ID(N'EnhanzerPOS') IS NULL
    CREATE DATABASE EnhanzerPOS;
GO
USE EnhanzerPOS;
GO
IF OBJECT_ID(N'dbo.Location_Details', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Location_Details
    (
        Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Location_Details PRIMARY KEY,
        Location_Code NVARCHAR(50)  NOT NULL CONSTRAINT UQ_Location_Details_Code UNIQUE,  -- from API
        Location_Name NVARCHAR(200) NOT NULL,                                              -- from API
        Created_At    DATETIME2     NOT NULL CONSTRAINT DF_Location_Details_Created DEFAULT SYSUTCDATETIME()
    );
END
GO