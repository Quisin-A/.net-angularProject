-- CREATE TABLE Users (
--     Id INT IDENTITY(1,1) PRIMARY KEY,
--     Name NVARCHAR(100) NOT NULL,
--     Email NVARCHAR(100) NOT NULL,
--     Password NVARCHAR(100) NOT NULL,
--     Role NVARCHAR(50) NOT NULL,
--     IsActive BIT DEFAULT 1
-- );

-- CREATE TABLE Rooms (
--     Id INT IDENTITY(1,1) PRIMARY KEY,
--     Name NVARCHAR(100) NOT NULL,
--     Capacity INT NOT NULL,
--     Location NVARCHAR(100) NOT NULL
-- );

-- CREATE TABLE Bookings (
--     Id INT IDENTITY(1,1) PRIMARY KEY,
--     RoomId INT NOT NULL,
--     UserId INT NOT NULL,
--     StartTime DATETIME NOT NULL,
--     EndTime DATETIME NOT NULL,

--     CONSTRAINT FK_Bookings_Rooms
--         FOREIGN KEY (RoomId)
--         REFERENCES Rooms(Id),

--     CONSTRAINT FK_Bookings_Users
--         FOREIGN KEY (UserId)
--         REFERENCES Users(Id)
-- );