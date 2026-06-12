/*
    Sales Visit Management System
    User, Team, and User Permission SQL Database Setup Script
    
    Instructions:
    1. Run Part 1 to create the tables (TeamMaster, UserMaster, and UserPermissionTable) and seed initial data.
    2. Run Part 2 to append/insert the operations logic into your APIVisitOperation stored procedure.
    3. Run Part 3 to review how to apply dynamic SQL permissions inside lists like Visit List or Target List.
*/

--------------------------------------------------------------------------------
-- PART 1: Table Creation and Seeding
--------------------------------------------------------------------------------

-- 1. Create TeamMaster Table if it does not exist
IF OBJECT_ID('dbo.TeamMaster', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TeamMaster (
        TeamID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        TeamName NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'admin',
        LastMaintDate DATETIME NULL,
        LastMaintBy NVARCHAR(50) NULL
    );
    PRINT 'Table dbo.TeamMaster created.';
END
GO

-- 2. Create UserMaster Table if it does not exist
IF OBJECT_ID('dbo.UserMaster', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserMaster (
        UserID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        FullName NVARCHAR(150) NOT NULL,
        Role NVARCHAR(50) NOT NULL,
        TeamID INT NULL FOREIGN KEY REFERENCES dbo.TeamMaster(TeamID),
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'admin',
        LastMaintDate DATETIME NULL,
        LastMaintBy NVARCHAR(50) NULL
    );
    PRINT 'Table dbo.UserMaster created.';
END
GO

-- 3. Create UserPermissionTable if it does not exist
IF OBJECT_ID('dbo.UserPermissionTable', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserPermissionTable (
        PermissionID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.UserMaster(Username),
        Component NVARCHAR(100) NOT NULL, -- 'Visit List', 'Target List', 'Gov List', 'Purpose List'
        SqlCondition NVARCHAR(MAX) NOT NULL, -- e.g. "UserTeam = 'Sales Team A'" or "Governorate = 'Cairo'"
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(50) NOT NULL DEFAULT 'admin',
        LastMaintDate DATETIME NULL,
        LastMaintBy NVARCHAR(50) NULL
    );
    PRINT 'Table dbo.UserPermissionTable created.';
END
GO

-- 4. Seed Initial Teams if empty
IF NOT EXISTS (SELECT 1 FROM dbo.TeamMaster)
BEGIN
    INSERT INTO dbo.TeamMaster (TeamName, CreatedBy)
    VALUES 
    (N'Sales Team A', N'admin'),
    (N'Sales Team B', N'admin'),
    (N'Marketing Team', N'admin');
    PRINT 'Seeded initial teams into dbo.TeamMaster.';
END
GO

-- 5. Seed Initial Users if empty
IF NOT EXISTS (SELECT 1 FROM dbo.UserMaster)
BEGIN
    -- Resolve Team IDs
    DECLARE @TeamA INT = (SELECT TOP 1 TeamID FROM dbo.TeamMaster WHERE TeamName = N'Sales Team A');
    DECLARE @TeamB INT = (SELECT TOP 1 TeamID FROM dbo.TeamMaster WHERE TeamName = N'Sales Team B');

    INSERT INTO dbo.UserMaster (Username, FullName, Role, TeamID, CreatedBy)
    VALUES 
    (N'admin', N'Mohammad Admin', N'Admin', @TeamA, N'admin'),
    (N'o.samir', N'Omar Samir', N'Salesperson', @TeamA, N'admin'),
    (N'm.ali', N'Mohammad Ali', N'Salesperson', @TeamB, N'admin'),
    (N'a.hassan', N'Ahmad Hassan', N'Salesperson', @TeamB, N'admin');
    PRINT 'Seeded initial users into dbo.UserMaster.';
END
GO

-- 6. Seed Initial Permissions if empty
IF NOT EXISTS (SELECT 1 FROM dbo.UserPermissionTable)
BEGIN
    -- Seed demo filters for salesperson Omar Samir
    INSERT INTO dbo.UserPermissionTable (Username, Component, SqlCondition, CreatedBy)
    VALUES 
    (N'o.samir', N'Visit List', N'UserTeam = ''Sales Team A''', N'admin'),
    (N'o.samir', N'Target List', N'Governorate = ''Cairo''', N'admin'),
    (N'o.samir', N'Gov List', N'Governorate IN (''Cairo'', ''Giza'')', N'admin');
    PRINT 'Seeded initial permissions into dbo.UserPermissionTable.';
END
GO


--------------------------------------------------------------------------------
-- PART 2: APIVisitOperation Stored Procedure Additions
--------------------------------------------------------------------------------
/*
    Instructions:
    Add these blocks inside the main body of your dbo.APIVisitOperation stored procedure.
*/

/*
    -- ==========================================
    -- User Master Operations
    -- ==========================================
    IF @operation = 'Get User List'
    BEGIN
        SELECT 
            u.UserID,
            u.Username,
            u.FullName,
            u.Role,
            u.TeamID,
            t.TeamName,
            u.IsActive
        FROM dbo.UserMaster u
        LEFT JOIN dbo.TeamMaster t ON u.TeamID = t.TeamID
        WHERE u.IsActive = 1;
        
        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END

    IF @operation = 'New User'
    BEGIN
        INSERT INTO dbo.UserMaster (Username, FullName, Role, TeamID, IsActive, CreatedBy)
        SELECT 
            Username, FullName, Role, TeamID, 1, ISNULL(@User, 'admin')
        FROM OPENJSON(@LineData)
        WITH (
            Username NVARCHAR(50),
            FullName NVARCHAR(150),
            Role NVARCHAR(50),
            TeamID INT
        );
        
        SET @state = 0;
        SET @message = 'User created successfully';
        RETURN;
    END

    IF @operation = 'Update User'
    BEGIN
        UPDATE u
        SET 
            u.FullName = j.FullName,
            u.Role = j.Role,
            u.TeamID = j.TeamID,
            u.LastMaintDate = GETDATE(),
            u.LastMaintBy = ISNULL(@User, 'admin')
        FROM dbo.UserMaster u
        INNER JOIN OPENJSON(@LineData)
        WITH (
            UserID INT,
            FullName NVARCHAR(150),
            Role NVARCHAR(50),
            TeamID INT
        ) j ON u.UserID = j.UserID;
        
        SET @state = 0;
        SET @message = 'User updated successfully';
        RETURN;
    END

    IF @operation = 'Delete User'
    BEGIN
        UPDATE u
        SET 
            u.IsActive = 0,
            u.LastMaintDate = GETDATE(),
            u.LastMaintBy = ISNULL(@User, 'admin')
        FROM dbo.UserMaster u
        INNER JOIN OPENJSON(@LineData)
        WITH (
            UserID INT
        ) j ON u.UserID = j.UserID;
        
        SET @state = 0;
        SET @message = 'User deleted successfully';
        RETURN;
    END

    -- ==========================================
    -- Team Master Operations
    -- ==========================================
    IF @operation = 'Get Team List'
    BEGIN
        SELECT 
            TeamID,
            TeamName,
            IsActive
        FROM dbo.TeamMaster
        WHERE IsActive = 1;
        
        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END

    IF @operation = 'New Team'
    BEGIN
        INSERT INTO dbo.TeamMaster (TeamName, IsActive, CreatedBy)
        SELECT 
            TeamName, 1, ISNULL(@User, 'admin')
        FROM OPENJSON(@LineData)
        WITH (
            TeamName NVARCHAR(100)
        );
        
        SET @state = 0;
        SET @message = 'Team created successfully';
        RETURN;
    END

    IF @operation = 'Update Team'
    BEGIN
        UPDATE t
        SET 
            t.TeamName = j.TeamName,
            t.LastMaintDate = GETDATE(),
            t.LastMaintBy = ISNULL(@User, 'admin')
        FROM dbo.TeamMaster t
        INNER JOIN OPENJSON(@LineData)
        WITH (
            TeamID INT,
            TeamName NVARCHAR(100)
        ) j ON t.TeamID = j.TeamID;
        
        SET @state = 0;
        SET @message = 'Team updated successfully';
        RETURN;
    END

    IF @operation = 'Delete Team'
    BEGIN
        UPDATE t
        SET 
            t.IsActive = 0,
            t.LastMaintDate = GETDATE(),
            t.LastMaintBy = ISNULL(@User, 'admin')
        FROM dbo.TeamMaster t
        INNER JOIN OPENJSON(@LineData)
        WITH (
            TeamID INT
        ) j ON t.TeamID = j.TeamID;
        
        SET @state = 0;
        SET @message = 'Team deleted successfully';
        RETURN;
    END

    -- ==========================================
    -- User Permission Operations
    -- ==========================================
    IF @operation = 'Get Permission List'
    BEGIN
        SELECT 
            p.PermissionID,
            p.Username,
            p.Component,
            p.SqlCondition,
            p.IsActive
        FROM dbo.UserPermissionTable p
        WHERE p.IsActive = 1;
        
        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END

    IF @operation = 'New Permission'
    BEGIN
        INSERT INTO dbo.UserPermissionTable (Username, Component, SqlCondition, IsActive, CreatedBy)
        SELECT 
            Username, Component, SqlCondition, 1, ISNULL(@User, 'admin')
        FROM OPENJSON(@LineData)
        WITH (
            Username NVARCHAR(50),
            Component NVARCHAR(100),
            SqlCondition NVARCHAR(MAX)
        );
        
        SET @state = 0;
        SET @message = 'Permission created successfully';
        RETURN;
    END

    IF @operation = 'Update Permission'
    BEGIN
        UPDATE p
        SET 
            p.Username = j.Username,
            p.Component = j.Component,
            p.SqlCondition = j.SqlCondition,
            p.LastMaintDate = GETDATE(),
            p.LastMaintBy = ISNULL(@User, 'admin')
        FROM dbo.UserPermissionTable p
        INNER JOIN OPENJSON(@LineData)
        WITH (
            PermissionID INT,
            Username NVARCHAR(50),
            Component NVARCHAR(100),
            SqlCondition NVARCHAR(MAX)
        ) j ON p.PermissionID = j.PermissionID;
        
        SET @state = 0;
        SET @message = 'Permission updated successfully';
        RETURN;
    END

    IF @operation = 'Delete Permission'
    BEGIN
        UPDATE p
        SET 
            p.IsActive = 0,
            p.LastMaintDate = GETDATE(),
            p.LastMaintBy = ISNULL(@User, 'admin')
        FROM dbo.UserPermissionTable p
        INNER JOIN OPENJSON(@LineData)
        WITH (
            PermissionID INT
        ) j ON p.PermissionID = j.PermissionID;
        
        SET @state = 0;
        SET @message = 'Permission deleted successfully';
        RETURN;
    END
*/


--------------------------------------------------------------------------------
-- PART 3: Dynamic SQL Permission Implementation Helper
--------------------------------------------------------------------------------
/*
    Here is an example showing how you can integrate the dynamic permissions filter
    inside your stored procedure lists.
    
    Example for 'Get Visit List':
    
    IF @operation = 'Get Visit List'
    BEGIN
        DECLARE @condition NVARCHAR(MAX) = NULL;
        DECLARE @sql NVARCHAR(MAX);
        
        -- 1. Query the allowed SQL Condition for this user
        SELECT TOP 1 @condition = SqlCondition 
        FROM dbo.UserPermissionTable 
        WHERE Username = @User 
          AND Component = 'Visit List' 
          AND IsActive = 1;
          
        -- 2. Build base SQL query
        SET @sql = N'
            SELECT 
                vh.*, 
                vt.TargetName,
                vp.PurposeName,
                vs.StatusName
            FROM dbo.VisitHeader vh
            LEFT JOIN dbo.VisitTargetMaster vt ON vh.TargetID = vt.TargetID
            LEFT JOIN dbo.VisitPurposeMaster vp ON vh.PurposeID = vp.PurposeID
            LEFT JOIN dbo.VisitStatusMaster vs ON vh.StatusID = vs.StatusID
            WHERE 1=1';
            
        -- 3. Append permission condition if set
        IF @condition IS NOT NULL AND @condition <> ''
        BEGIN
            SET @sql = @sql + N' AND (' + @condition + N')';
        END
        
        -- 4. Execute dynamically
        EXEC sp_executesql @sql;
        
        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END
*/
