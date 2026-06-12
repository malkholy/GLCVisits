/*
    Sales Visit Management System
    Stored Procedure Update: Get Unified Survey Dashboard Data (Aggregate + Single)
    
    Instructions:
    1. Append this operation block to your main APIVisitOperation (or APIVisitHeaderOperation) stored procedure.
*/

-- ============================================================
-- Get Unified Survey Dashboard Data (Aggregate or Single Target)
-- ============================================================
IF @operation = 'Get Survey Dashboard Data'
BEGIN
    DECLARE @TargetVisitID INT, @TemplateID INT;

    -- Extract filters from LineData JSON
    SELECT 
        @TargetVisitID = VisitID,
        @TemplateID = SurveyTemplateID
    FROM OPENJSON(@LineData)
    WITH (
        VisitID INT,
        SurveyTemplateID INT
    );

    -- If TemplateID is null, default to the active template
    IF @TemplateID IS NULL
        SELECT TOP 1 @TemplateID = SurveyTemplateID FROM dbo.SurveyTemplateHeader ORDER BY IsActive DESC, SurveyTemplateID DESC;

    ------------------------------------------------------------
    -- PATH A: SINGLE SHOWROOM AUDIT (When TargetVisitID is provided)
    ------------------------------------------------------------
    IF @TargetVisitID IS NOT NULL
    BEGIN
        -- List0: Visit & Report Header Info
        SELECT 
            vh.VisitID,
            vh.VisitNo,
            vh.VisitDate,
            vt.TargetName,
            u.FullName AS SalespersonName,
            st.SurveyName,
            vh.CheckInDateTime,
            vh.CheckOutDateTime,
            vh.VisitDurationMinutes
        FROM dbo.VisitHeader vh
        LEFT JOIN dbo.VisitTargetMaster vt ON vh.TargetID = vt.TargetID
        LEFT JOIN dbo.UserMaster u ON vh.SalespersonID = u.UserID
        LEFT JOIN dbo.VisitSurveyHeader vsh ON vh.VisitID = vsh.VisitID
        LEFT JOIN dbo.SurveyTemplateHeader st ON vsh.SurveyTemplateID = st.SurveyTemplateID
        WHERE vh.VisitID = @TargetVisitID;

        -- List1: Single Audit KPIs (Compliance, Tasks Count, Competitors Count)
        SELECT 
            (SELECT COUNT(1) FROM dbo.VisitFollowUpTask WHERE VisitID = @TargetVisitID) AS TasksGenerated,
            (SELECT COUNT(1) FROM dbo.VisitCompetitorInfo WHERE VisitID = @TargetVisitID) AS CompetitorsLogged,
            CASE 
                WHEN COUNT(1) = 0 THEN 0
                ELSE CAST(ROUND((SUM(CASE WHEN o.OptionValue IN ('Yes', 'Excellent', 'Good') THEN 1.0 ELSE 0.0 END) / COUNT(1)) * 100, 0) AS INT)
            END AS ComplianceScore
        FROM dbo.VisitSurveyAnswer a
        JOIN dbo.VisitSurveyHeader h ON a.VisitSurveyID = h.VisitSurveyID
        LEFT JOIN dbo.SurveyQuestionOption o ON a.OptionID = o.OptionID
        WHERE h.VisitID = @TargetVisitID;

        -- List2: Survey Questions & Responses
        SELECT 
            q.QuestionID,
            q.QuestionText,
            g.GroupName AS CategoryName,
            ISNULL(o.OptionText, a.AnswerText) AS SelectedAnswer,
            q.QuestionType,
            q.DisplayOrder
        FROM dbo.VisitSurveyAnswer a
        JOIN dbo.VisitSurveyHeader h ON a.VisitSurveyID = h.VisitSurveyID
        JOIN dbo.SurveyQuestion q ON a.QuestionID = q.QuestionID
        JOIN dbo.SurveyGroup g ON q.SurveyGroupID = g.SurveyGroupID
        LEFT JOIN dbo.SurveyQuestionOption o ON a.OptionID = o.OptionID
        WHERE h.VisitID = @TargetVisitID
        ORDER BY g.DisplayOrder, q.DisplayOrder;

        -- List3: Logged Follow-up Tasks
        SELECT FollowUpTaskID, TaskTitle, TaskDescription, DueDate, Priority, TaskStatus
        FROM dbo.VisitFollowUpTask
        WHERE VisitID = @TargetVisitID;

        -- List4: Logged Competitor Info
        SELECT CompetitorInfoID, CompetitorName, ProductName, Price, OfferDescription, Notes
        FROM dbo.VisitCompetitorInfo
        WHERE VisitID = @TargetVisitID;
        
        -- List5: Display Inspection
        SELECT DisplayInspectionID, IsDisplayClean, IsColorCardAvailable, IsStandAvailable, Notes
        FROM dbo.VisitDisplayInspection
        WHERE VisitID = @TargetVisitID;

        SET @state = 0;
        SET @message = 'Success Single Showroom Report';
        RETURN;
    END

    ------------------------------------------------------------
    -- PATH B: AGGREGATE ANALYTICS (When TargetVisitID is null)
    ------------------------------------------------------------
    -- List0: Summary Metrics (Compliance, Questions Count, Total Audited)
    SELECT 
        (SELECT COUNT(DISTINCT VisitSurveyID) FROM dbo.VisitSurveyHeader WHERE SurveyTemplateID = @TemplateID) AS TotalShowroomsAudited,
        (SELECT COUNT(1) FROM dbo.SurveyQuestion WHERE SurveyTemplateID = @TemplateID AND IsActive = 1) AS TotalQuestionsAudited,
        ISNULL((
            SELECT CAST(ROUND(AVG(sub.Score), 0) AS INT)
            FROM (
                SELECT 
                    h.VisitSurveyID,
                    (SUM(CASE WHEN o.OptionValue IN ('Yes', 'Excellent', 'Good') THEN 1.0 ELSE 0.0 END) / COUNT(1)) * 100 AS Score
                FROM dbo.VisitSurveyAnswer a
                JOIN dbo.VisitSurveyHeader h ON a.VisitSurveyID = h.VisitSurveyID
                LEFT JOIN dbo.SurveyQuestionOption o ON a.OptionID = o.OptionID
                WHERE h.SurveyTemplateID = @TemplateID
                GROUP BY h.VisitSurveyID
            ) sub
        ), 0) AS OverallShowroomCompliance;

    -- List1: Questions Answer distribution table
    SELECT 
        q.QuestionID,
        q.QuestionCode,
        q.QuestionText,
        g.GroupName AS CategoryName,
        o.OptionText AS AnswerOptionText,
        COUNT(a.AnswerID) AS TotalOptionCount,
        (SELECT COUNT(1) 
         FROM dbo.VisitSurveyAnswer sa 
         JOIN dbo.VisitSurveyHeader sh ON sa.VisitSurveyID = sh.VisitSurveyID
         WHERE sa.QuestionID = q.QuestionID AND sh.SurveyTemplateID = @TemplateID) AS TotalQuestionResponses
    FROM dbo.SurveyQuestion q
    JOIN dbo.SurveyGroup g ON q.SurveyGroupID = g.SurveyGroupID
    LEFT JOIN dbo.VisitSurveyAnswer a ON q.QuestionID = a.QuestionID
    LEFT JOIN dbo.SurveyQuestionOption o ON a.OptionID = o.OptionID
    LEFT JOIN dbo.VisitSurveyHeader h ON a.VisitSurveyID = h.VisitSurveyID
    WHERE q.SurveyTemplateID = @TemplateID AND q.IsActive = 1 AND o.OptionID IS NOT NULL AND h.SurveyTemplateID = @TemplateID
    GROUP BY q.QuestionID, q.QuestionCode, q.QuestionText, g.GroupName, o.OptionText, g.DisplayOrder, q.DisplayOrder
    ORDER BY g.DisplayOrder, q.DisplayOrder, o.OptionText;

    -- List2: List of all Audited Showrooms / Visits for this Template (For the dropdown selector)
    SELECT 
        vh.VisitID,
        vh.VisitNo,
        vt.TargetName,
        vh.VisitDate
    FROM dbo.VisitHeader vh
    JOIN dbo.VisitTargetMaster vt ON vh.TargetID = vt.TargetID
    JOIN dbo.VisitSurveyHeader vsh ON vsh.VisitID = vh.VisitID
    WHERE vsh.SurveyTemplateID = @TemplateID
    ORDER BY vh.VisitDate DESC;
    
    SET @state = 0;
    SET @message = 'Success Aggregate Survey Analytics';
    RETURN;
END
