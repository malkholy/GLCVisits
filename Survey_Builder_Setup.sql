/*
    Sales Visit Management System
    Survey Builder SQL Database Setup Script
    
    Instructions:
    1. Run this script to deploy the User Template operations inside your APIVisitOperation stored procedure.
*/

--------------------------------------------------------------------------------
-- APIVisitOperation Stored Procedure Additions
--------------------------------------------------------------------------------

/*
    -- ==========================================
    -- Get Survey Template List
    -- ==========================================
    IF @operation = 'Get Survey Template List'
    BEGIN
        SELECT 
            s.SurveyTemplateID,
            s.SurveyCode,
            s.SurveyName,
            s.TargetTypeID,
            tt.TargetTypeName,
            s.PurposeID,
            vp.PurposeName,
            s.UserTeam,
            s.IsActive
        FROM dbo.SurveyTemplateHeader s
        LEFT JOIN dbo.TargetTypeMaster tt ON s.TargetTypeID = tt.TargetTypeID
        LEFT JOIN dbo.VisitPurposeMaster vp ON s.PurposeID = vp.PurposeID
        WHERE s.IsActive = 1;
        
        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END

    -- ==========================================
    -- Get Survey Template Details
    -- ==========================================
    IF @operation = 'Get Survey Template Details'
    BEGIN
        DECLARE @TemplateID INT = NULL;
        
        SELECT @TemplateID = SurveyTemplateID 
        FROM OPENJSON(@LineData) 
        WITH (SurveyTemplateID INT);

        -- List0: Header details
        SELECT 
            SurveyTemplateID,
            SurveyCode,
            SurveyName,
            TargetTypeID,
            PurposeID,
            UserTeam,
            IsActive
        FROM dbo.SurveyTemplateHeader 
        WHERE SurveyTemplateID = @TemplateID;

        -- List1: Groups
        SELECT 
            SurveyGroupID,
            SurveyTemplateID,
            GroupCode,
            GroupName,
            DisplayOrder,
            IsActive
        FROM dbo.SurveyGroup 
        WHERE SurveyTemplateID = @TemplateID AND IsActive = 1 
        ORDER BY DisplayOrder;

        -- List2: Questions
        SELECT 
            q.QuestionID,
            q.SurveyTemplateID,
            q.SurveyGroupID,
            g.GroupCode, -- Helper to map group in UI
            q.QuestionCode,
            q.QuestionText,
            q.QuestionType,
            q.IsRequired,
            q.DisplayOrder,
            q.IsActive
        FROM dbo.SurveyQuestion q
        LEFT JOIN dbo.SurveyGroup g ON q.SurveyGroupID = g.SurveyGroupID
        WHERE q.SurveyTemplateID = @TemplateID AND q.IsActive = 1 
        ORDER BY q.DisplayOrder;

        -- List3: Options
        SELECT 
            o.OptionID,
            o.QuestionID,
            q.QuestionCode, -- Helper to map option in UI
            o.OptionText,
            o.OptionValue,
            o.DisplayOrder,
            o.IsActive
        FROM dbo.SurveyQuestionOption o
        INNER JOIN dbo.SurveyQuestion q ON o.QuestionID = q.QuestionID
        WHERE q.SurveyTemplateID = @TemplateID AND o.IsActive = 1 AND q.IsActive = 1
        ORDER BY o.DisplayOrder;

        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END

    -- ==========================================
    -- Delete Survey Template
    -- ==========================================
    IF @operation = 'Delete Survey Template'
    BEGIN
        DECLARE @DeleteTemplateID INT = NULL;
        
        SELECT @DeleteTemplateID = SurveyTemplateID 
        FROM OPENJSON(@LineData) 
        WITH (SurveyTemplateID INT);

        BEGIN TRANSACTION;
        BEGIN TRY
            -- Soft delete template
            UPDATE dbo.SurveyTemplateHeader
            SET IsActive = 0, LastMaintDate = GETDATE(), LastMaintBy = ISNULL(@User, 'admin')
            WHERE SurveyTemplateID = @DeleteTemplateID;

            -- Soft delete groups
            UPDATE dbo.SurveyGroup
            SET IsActive = 0
            WHERE SurveyTemplateID = @DeleteTemplateID;

            -- Soft delete questions
            UPDATE dbo.SurveyQuestion
            SET IsActive = 0
            WHERE SurveyTemplateID = @DeleteTemplateID;

            COMMIT TRANSACTION;
            SET @state = 0;
            SET @message = 'Survey Template deleted successfully';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            SET @state = 1;
            SET @message = ERROR_MESSAGE();
        END CATCH

        RETURN;
    END

    -- ==========================================
    -- Save Survey Template (Nested JSON Upsert)
    -- ==========================================
    IF @operation = 'Save Survey Template'
    BEGIN
        DECLARE @SaveTemplateID INT = NULL;
        DECLARE @SurveyCode NVARCHAR(50) = NULL;
        DECLARE @SurveyName NVARCHAR(200) = NULL;
        DECLARE @TargetTypeID INT = NULL;
        DECLARE @PurposeID INT = NULL;
        DECLARE @UserTeam NVARCHAR(50) = NULL;

        -- Extract Header Properties
        SELECT 
            @SaveTemplateID = SurveyTemplateID,
            @SurveyCode = SurveyCode,
            @SurveyName = SurveyName,
            @TargetTypeID = TargetTypeID,
            @PurposeID = PurposeID,
            @UserTeam = UserTeam
        FROM OPENJSON(@LineData)
        WITH (
            SurveyTemplateID INT,
            SurveyCode NVARCHAR(50),
            SurveyName NVARCHAR(200),
            TargetTypeID INT,
            PurposeID INT,
            UserTeam NVARCHAR(50)
        );

        BEGIN TRANSACTION;
        BEGIN TRY
            -- 1. Upsert SurveyTemplateHeader
            IF @SaveTemplateID IS NULL OR @SaveTemplateID = 0
            BEGIN
                -- Prevent duplicates on unique code
                IF EXISTS (SELECT 1 FROM dbo.SurveyTemplateHeader WHERE SurveyCode = @SurveyCode AND IsActive = 1)
                BEGIN
                    RAISERROR('Survey Code already exists.', 16, 1);
                END

                INSERT INTO dbo.SurveyTemplateHeader (SurveyCode, SurveyName, TargetTypeID, PurposeID, UserTeam, CreatedBy)
                VALUES (@SurveyCode, @SurveyName, @TargetTypeID, @PurposeID, @UserTeam, ISNULL(@User, 'admin'));
                
                SET @SaveTemplateID = SCOPE_IDENTITY();
            END
            ELSE
            BEGIN
                UPDATE dbo.SurveyTemplateHeader
                SET 
                    SurveyCode = @SurveyCode,
                    SurveyName = @SurveyName,
                    TargetTypeID = @TargetTypeID,
                    PurposeID = @PurposeID,
                    UserTeam = @UserTeam,
                    LastMaintDate = GETDATE(),
                    LastMaintBy = ISNULL(@User, 'admin')
                WHERE SurveyTemplateID = @SaveTemplateID;
            END

            -- 2. Extract Groups from JSON and Upsert
            SELECT 
                GroupCode,
                GroupName,
                DisplayOrder
            INTO #JSONGroups
            FROM OPENJSON(@LineData, '$.Groups')
            WITH (
                GroupCode NVARCHAR(50),
                GroupName NVARCHAR(150),
                DisplayOrder INT
            );

            -- Merge Groups (Insert or Update)
            MERGE dbo.SurveyGroup AS target
            USING #JSONGroups AS source
            ON (target.SurveyTemplateID = @SaveTemplateID AND target.GroupCode = source.GroupCode)
            WHEN MATCHED THEN
                UPDATE SET 
                    target.GroupName = source.GroupName,
                    target.DisplayOrder = source.DisplayOrder,
                    target.IsActive = 1
            WHEN NOT MATCHED THEN
                INSERT (SurveyTemplateID, GroupCode, GroupName, DisplayOrder, IsActive)
                VALUES (@SaveTemplateID, source.GroupCode, source.GroupName, source.DisplayOrder, 1);

            -- Soft delete omitted groups
            UPDATE dbo.SurveyGroup
            SET IsActive = 0
            WHERE SurveyTemplateID = @SaveTemplateID
              AND GroupCode NOT IN (SELECT GroupCode FROM #JSONGroups);

            -- 3. Extract Questions from JSON and Upsert
            SELECT 
                QuestionCode,
                GroupCode,
                QuestionText,
                QuestionType,
                IsRequired,
                DisplayOrder
            INTO #JSONQuestions
            FROM OPENJSON(@LineData, '$.Questions')
            WITH (
                QuestionCode NVARCHAR(50),
                GroupCode NVARCHAR(50),
                QuestionText NVARCHAR(500),
                QuestionType NVARCHAR(50),
                IsRequired BIT,
                DisplayOrder INT
            );

            -- Merge Questions
            -- First, we need to join with groups to get correct SurveyGroupID
            SELECT 
                jq.QuestionCode,
                g.SurveyGroupID,
                jq.QuestionText,
                jq.QuestionType,
                jq.IsRequired,
                jq.DisplayOrder
            INTO #QuestionsToUpsert
            FROM #JSONQuestions jq
            LEFT JOIN dbo.SurveyGroup g ON g.SurveyTemplateID = @SaveTemplateID AND g.GroupCode = jq.GroupCode AND g.IsActive = 1;

            MERGE dbo.SurveyQuestion AS target
            USING #QuestionsToUpsert AS source
            ON (target.SurveyTemplateID = @SaveTemplateID AND target.QuestionCode = source.QuestionCode)
            WHEN MATCHED THEN
                UPDATE SET 
                    target.SurveyGroupID = source.SurveyGroupID,
                    target.QuestionText = source.QuestionText,
                    target.QuestionType = source.QuestionType,
                    target.IsRequired = source.IsRequired,
                    target.DisplayOrder = source.DisplayOrder,
                    target.IsActive = 1
            WHEN NOT MATCHED THEN
                INSERT (SurveyTemplateID, SurveyGroupID, QuestionCode, QuestionText, QuestionType, IsRequired, DisplayOrder, IsActive)
                VALUES (@SaveTemplateID, source.SurveyGroupID, source.QuestionCode, source.QuestionText, source.QuestionType, source.IsRequired, source.DisplayOrder, 1);

            -- Soft delete omitted questions
            UPDATE dbo.SurveyQuestion
            SET IsActive = 0
            WHERE SurveyTemplateID = @SaveTemplateID
              AND QuestionCode NOT IN (SELECT QuestionCode FROM #JSONQuestions);

            -- 4. Delete and Re-insert Options
            -- We delete options for all questions in this template
            DELETE o
            FROM dbo.SurveyQuestionOption o
            INNER JOIN dbo.SurveyQuestion q ON o.QuestionID = q.QuestionID
            WHERE q.SurveyTemplateID = @SaveTemplateID;

            -- Extract and Insert Options
            SELECT 
                QuestionCode,
                OptionText,
                OptionValue,
                DisplayOrder
            INTO #JSONOptions
            FROM OPENJSON(@LineData, '$.Options')
            WITH (
                QuestionCode NVARCHAR(50),
                OptionText NVARCHAR(200),
                OptionValue NVARCHAR(100),
                DisplayOrder INT
            );

            INSERT INTO dbo.SurveyQuestionOption (QuestionID, OptionText, OptionValue, DisplayOrder, IsActive)
            SELECT 
                q.QuestionID,
                jo.OptionText,
                jo.OptionValue,
                jo.DisplayOrder,
                1
            FROM #JSONOptions jo
            INNER JOIN dbo.SurveyQuestion q ON q.SurveyTemplateID = @SaveTemplateID AND q.QuestionCode = jo.QuestionCode AND q.IsActive = 1;

            -- Clean up temporary tables
            DROP TABLE #JSONGroups;
            DROP TABLE #JSONQuestions;
            DROP TABLE #QuestionsToUpsert;
            DROP TABLE #JSONOptions;

            COMMIT TRANSACTION;
            SET @state = 0;
            SET @message = 'Survey Template saved successfully';
            
            -- Return the ID of the saved template for UI loading
            SELECT @SaveTemplateID AS SurveyTemplateID;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            
            -- Safely clean up if they exist
            IF OBJECT_ID('tempdb..#JSONGroups') IS NOT NULL DROP TABLE #JSONGroups;
            IF OBJECT_ID('tempdb..#JSONQuestions') IS NOT NULL DROP TABLE #JSONQuestions;
            IF OBJECT_ID('tempdb..#QuestionsToUpsert') IS NOT NULL DROP TABLE #QuestionsToUpsert;
            IF OBJECT_ID('tempdb..#JSONOptions') IS NOT NULL DROP TABLE #JSONOptions;

            SET @state = 1;
            SET @message = ERROR_MESSAGE();
        END CATCH

        RETURN;
    END

    -- ==========================================
    -- Submit Survey
    -- ==========================================
    IF @operation = 'Submit Survey'
    BEGIN
        DECLARE @VisitID INT = NULL;
        DECLARE @SurveyTemplateID INT = NULL;
        DECLARE @SurveyStatus NVARCHAR(30) = 'Submitted';
        
        SELECT 
            @VisitID = VisitID,
            @SurveyTemplateID = SurveyTemplateID,
            @SurveyStatus = ISNULL(SurveyStatus, 'Submitted')
        FROM OPENJSON(@LineData)
        WITH (
            VisitID INT,
            SurveyTemplateID INT,
            SurveyStatus NVARCHAR(30)
        );

        IF @VisitID IS NULL OR @SurveyTemplateID IS NULL
        BEGIN
            SET @state = 1;
            SET @message = 'VisitID and SurveyTemplateID are required.';
            RETURN;
        END

        BEGIN TRANSACTION;
        BEGIN TRY
            DECLARE @VisitSurveyID INT = NULL;
            
            SELECT @VisitSurveyID = VisitSurveyID
            FROM dbo.VisitSurveyHeader
            WHERE VisitID = @VisitID AND SurveyTemplateID = @SurveyTemplateID;
            
            IF @VisitSurveyID IS NULL
            BEGIN
                INSERT INTO dbo.VisitSurveyHeader (VisitID, SurveyTemplateID, SurveyStatus, AnsweredQuestions, TotalQuestions, SubmittedDate, SubmittedBy, CreatedBy)
                VALUES (@VisitID, @SurveyTemplateID, @SurveyStatus, 0, 0, CASE WHEN @SurveyStatus = 'Submitted' THEN GETDATE() ELSE NULL END, CASE WHEN @SurveyStatus = 'Submitted' THEN ISNULL(@User, 'admin') ELSE NULL END, ISNULL(@User, 'admin'));
                
                SET @VisitSurveyID = SCOPE_IDENTITY();
            END
            ELSE
            BEGIN
                UPDATE dbo.VisitSurveyHeader
                SET 
                    SurveyStatus = @SurveyStatus,
                    SubmittedDate = CASE WHEN @SurveyStatus = 'Submitted' THEN GETDATE() ELSE SubmittedDate END,
                    SubmittedBy = CASE WHEN @SurveyStatus = 'Submitted' THEN ISNULL(@User, 'admin') ELSE SubmittedBy END
                WHERE VisitSurveyID = @VisitSurveyID;
            END

            -- Extract answers
            SELECT 
                QuestionID, AnswerText, AnswerNumber, AnswerDate, OptionID, IsAnswered
            INTO #JSONAnswers
            FROM OPENJSON(@LineData, '$[0].Answers')
            WITH (
                QuestionID INT,
                AnswerText NVARCHAR(MAX),
                AnswerNumber DECIMAL(18,4),
                AnswerDate DATE,
                OptionID INT,
                IsAnswered BIT
            );

            -- Merge Answers
            MERGE dbo.VisitSurveyAnswer AS target
            USING #JSONAnswers AS source
            ON (target.VisitSurveyID = @VisitSurveyID AND target.QuestionID = source.QuestionID)
            WHEN MATCHED THEN
                UPDATE SET 
                    target.AnswerText = source.AnswerText,
                    target.AnswerNumber = source.AnswerNumber,
                    target.AnswerDate = source.AnswerDate,
                    target.OptionID = source.OptionID,
                    target.IsAnswered = source.IsAnswered,
                    target.LastMaintDate = GETDATE(),
                    target.LastMaintBy = ISNULL(@User, 'admin')
            WHEN NOT MATCHED THEN
                INSERT (VisitSurveyID, QuestionID, AnswerText, AnswerNumber, AnswerDate, OptionID, IsAnswered, CreatedBy)
                VALUES (@VisitSurveyID, source.QuestionID, source.AnswerText, source.AnswerNumber, source.AnswerDate, source.OptionID, source.IsAnswered, ISNULL(@User, 'admin'));

            -- Update counts on header
            UPDATE dbo.VisitSurveyHeader
            SET 
                AnsweredQuestions = (SELECT COUNT(*) FROM dbo.VisitSurveyAnswer WHERE VisitSurveyID = @VisitSurveyID AND IsAnswered = 1),
                TotalQuestions = (SELECT COUNT(*) FROM dbo.VisitSurveyAnswer WHERE VisitSurveyID = @VisitSurveyID)
            WHERE VisitSurveyID = @VisitSurveyID;

            -- Update VisitHeader submission status
            UPDATE dbo.VisitHeader
            SET IsSurveySubmitted = CASE WHEN @SurveyStatus = 'Submitted' THEN 1 ELSE 0 END
            WHERE VisitID = @VisitID;

            DROP TABLE #JSONAnswers;

            COMMIT TRANSACTION;
            SET @state = 0;
            SET @message = 'Survey submitted successfully';
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            IF OBJECT_ID('tempdb..#JSONAnswers') IS NOT NULL DROP TABLE #JSONAnswers;

            SET @state = 1;
            SET @message = ERROR_MESSAGE();
        END CATCH

        RETURN;
    END

    -- ==========================================
    -- Get Survey Answers
    -- ==========================================
    IF @operation = 'Get Survey Answers'
    BEGIN
        DECLARE @GetVisitID INT = NULL;
        
        SELECT @GetVisitID = VisitID 
        FROM OPENJSON(@LineData) 
        WITH (VisitID INT);
        
        -- List0: Header
        SELECT 
            VisitSurveyID,
            VisitID,
            SurveyTemplateID,
            SurveyStatus,
            AnsweredQuestions,
            TotalQuestions,
            SubmittedDate,
            SubmittedBy
        FROM dbo.VisitSurveyHeader
        WHERE VisitID = @GetVisitID;
        
        -- List1: Answers
        SELECT 
            a.AnswerID,
            a.VisitSurveyID,
            a.QuestionID,
            q.QuestionCode,
            a.AnswerText,
            a.AnswerNumber,
            a.AnswerDate,
            a.OptionID,
            o.OptionText,
            a.IsAnswered
        FROM dbo.VisitSurveyAnswer a
        INNER JOIN dbo.VisitSurveyHeader h ON a.VisitSurveyID = h.VisitSurveyID
        INNER JOIN dbo.SurveyQuestion q ON a.QuestionID = q.QuestionID
        LEFT JOIN dbo.SurveyQuestionOption o ON a.OptionID = o.OptionID
        WHERE h.VisitID = @GetVisitID;
        
        SET @state = 0;
        SET @message = 'Success';
        RETURN;
    END
*/
