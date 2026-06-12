/*
    Sales Visit Management System
    Stored Procedure Update: Fix 'Get Visit List' Missing Columns
    
    Instructions:
    1. Replace the existing 'Get Visit List' operation block inside your APIVisitOperation 
       (or APIVisitHeaderOperation) stored procedure with the one below.
*/

-- ==========================================
-- Get Visit List (with all columns for DataGrid)
-- ==========================================
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
      
    -- 2. Build base SQL query (joining targets, target types, and salesperson details)
    SET @sql = N'
        SELECT 
            vh.*, 
            vt.TargetName,
            vt.Governorate,
            vt.Area,
            tt.TargetTypeName,
            vp.PurposeName,
            vs.StatusName,
            u.FullName AS SalespersonName
        FROM dbo.VisitHeader vh
        LEFT JOIN dbo.VisitTargetMaster vt ON vh.TargetID = vt.TargetID
        LEFT JOIN dbo.TargetTypeMaster tt ON vh.TargetTypeID = tt.TargetTypeID
        LEFT JOIN dbo.VisitPurposeMaster vp ON vh.PurposeID = vp.PurposeID
        LEFT JOIN dbo.VisitStatusMaster vs ON vh.StatusID = vs.StatusID
        LEFT JOIN dbo.UserMaster u ON vh.SalespersonID = u.UserID
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
GO
