-- ============================================
-- El Hotel Database Schema
-- SQL Server Database
-- ============================================

-- Create Database
CREATE DATABASE HotelDB;
GO
USE HotelDB;
GO

-- ============================================
-- Users Table (for authentication)
-- ============================================
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Customer', -- Customer, Staff, Admin
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- ============================================
-- Customers Table
-- ============================================
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Phone NVARCHAR(20),
    Address NVARCHAR(200),
    IDNumber NVARCHAR(50), -- National ID or Passport
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ============================================
-- Staff Table
-- ============================================
CREATE TABLE Staff (
    StaffID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Position NVARCHAR(50) NOT NULL, -- Receptionist, Manager, Housekeeping
    Phone NVARCHAR(20),
    HireDate DATE NOT NULL,
    Salary DECIMAL(10,2),
    IsActive BIT DEFAULT 1
);

-- ============================================
-- Room Types Table
-- ============================================
CREATE TABLE RoomTypes (
    RoomTypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50) NOT NULL, -- Single, Double, Suite, Deluxe
    Description NVARCHAR(500),
    BasePrice DECIMAL(10,2) NOT NULL,
    Capacity INT NOT NULL
);

-- ============================================
-- Rooms Table
-- ============================================
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY IDENTITY(1,1),
    RoomNumber NVARCHAR(10) NOT NULL UNIQUE,
    RoomTypeID INT FOREIGN KEY REFERENCES RoomTypes(RoomTypeID),
    Floor INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Available', -- Available, Occupied, Maintenance
    Description NVARCHAR(500)
);

-- ============================================
-- Bookings Table
-- ============================================
CREATE TABLE Bookings (
    BookingID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),
    RoomID INT FOREIGN KEY REFERENCES Rooms(RoomID),
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    BookingDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'Pending', -- Pending, Confirmed, CheckedIn, CheckedOut, Cancelled
    TotalAmount DECIMAL(10,2),
    Notes NVARCHAR(500)
);

-- ============================================
-- Payments Table
-- ============================================
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT FOREIGN KEY REFERENCES Bookings(BookingID),
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL, -- Cash, Card, Online
    PaymentDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'Completed', -- Pending, Completed, Refunded
    ReceiptNumber NVARCHAR(50) UNIQUE
);

-- ============================================
-- Check-In/Out Log Table
-- ============================================
CREATE TABLE CheckInOutLog (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    BookingID INT FOREIGN KEY REFERENCES Bookings(BookingID),
    StaffID INT FOREIGN KEY REFERENCES Staff(StaffID),
    ActionType NVARCHAR(20) NOT NULL, -- CheckIn, CheckOut
    ActionTime DATETIME DEFAULT GETDATE(),
    Notes NVARCHAR(500)
);

-- ============================================
-- Reports Table (Optional - for storing generated reports)
-- ============================================
CREATE TABLE Reports (
    ReportID INT PRIMARY KEY IDENTITY(1,1),
    ReportType NVARCHAR(50) NOT NULL, -- Occupancy, Revenue, Staff
    GeneratedBy INT FOREIGN KEY REFERENCES Users(UserID),
    GeneratedAt DATETIME DEFAULT GETDATE(),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ReportData NVARCHAR(MAX), -- JSON format
    Notes NVARCHAR(500)
);

-- ============================================
-- Insert Default Room Types (Prices in Egyptian Pounds - EGP)
-- ============================================
INSERT INTO RoomTypes (TypeName, Description, BasePrice, Capacity) VALUES
('Single', 'Single bed room for one person', 2500.00, 1),
('Double', 'Double bed room for two persons', 4000.00, 2),
('Suite', 'Luxury suite with Nile view and living area', 7500.00, 3),
('Deluxe', 'Premium room with all amenities and panoramic views', 10000.00, 4);

-- ============================================
-- Insert Sample Rooms (50 Rooms across 5 floors)
-- ============================================

-- Ground Floor (Floor 1) - 10 Rooms
INSERT INTO Rooms (RoomNumber, RoomTypeID, Floor, Status, Description) VALUES
('101', 1, 1, 'Available', 'Ground floor single room with garden view'),
('102', 1, 1, 'Available', 'Ground floor single room with garden view'),
('103', 1, 1, 'Occupied', 'Ground floor single room near reception'),
('104', 2, 1, 'Available', 'Ground floor double room with garden view'),
('105', 2, 1, 'Available', 'Ground floor double room with garden view'),
('106', 2, 1, 'Maintenance', 'Ground floor double room - under renovation'),
('107', 1, 1, 'Available', 'Ground floor single room accessible'),
('108', 2, 1, 'Available', 'Ground floor double room accessible'),
('109', 1, 1, 'Available', 'Ground floor single room quiet zone'),
('110', 2, 1, 'Occupied', 'Ground floor double room near pool');

-- Second Floor (Floor 2) - 10 Rooms
INSERT INTO Rooms (RoomNumber, RoomTypeID, Floor, Status, Description) VALUES
('201', 2, 2, 'Available', 'Second floor double room with city view'),
('202', 2, 2, 'Available', 'Second floor double room with city view'),
('203', 2, 2, 'Occupied', 'Second floor double room corner unit'),
('204', 3, 2, 'Available', 'Second floor suite with balcony'),
('205', 3, 2, 'Available', 'Second floor suite with living area'),
('206', 2, 2, 'Available', 'Second floor double room quiet zone'),
('207', 2, 2, 'Available', 'Second floor double room'),
('208', 3, 2, 'Occupied', 'Second floor suite premium'),
('209', 2, 2, 'Available', 'Second floor double room'),
('210', 2, 2, 'Available', 'Second floor double room with Nile view');

-- Third Floor (Floor 3) - 10 Rooms
INSERT INTO Rooms (RoomNumber, RoomTypeID, Floor, Status, Description) VALUES
('301', 3, 3, 'Available', 'Third floor suite with Nile view'),
('302', 3, 3, 'Available', 'Third floor suite with balcony'),
('303', 3, 3, 'Available', 'Third floor suite corner unit'),
('304', 4, 3, 'Occupied', 'Third floor deluxe room premium'),
('305', 4, 3, 'Available', 'Third floor deluxe room with jacuzzi'),
('306', 3, 3, 'Available', 'Third floor suite'),
('307', 3, 3, 'Available', 'Third floor suite with city view'),
('308', 4, 3, 'Available', 'Third floor deluxe room'),
('309', 3, 3, 'Maintenance', 'Third floor suite - maintenance'),
('310', 4, 3, 'Available', 'Third floor deluxe room with Nile view');

-- Fourth Floor (Floor 4) - 10 Rooms
INSERT INTO Rooms (RoomNumber, RoomTypeID, Floor, Status, Description) VALUES
('401', 4, 4, 'Available', 'Fourth floor deluxe room panoramic view'),
('402', 4, 4, 'Available', 'Fourth floor deluxe room with terrace'),
('403', 4, 4, 'Occupied', 'Fourth floor deluxe room VIP'),
('404', 4, 4, 'Available', 'Fourth floor deluxe room executive'),
('405', 3, 4, 'Available', 'Fourth floor suite'),
('406', 3, 4, 'Available', 'Fourth floor suite with office'),
('407', 4, 4, 'Available', 'Fourth floor deluxe room'),
('408', 4, 4, 'Available', 'Fourth floor deluxe room honeymoon'),
('409', 3, 4, 'Available', 'Fourth floor suite family'),
('410', 4, 4, 'Available', 'Fourth floor deluxe room with Nile view');

-- Fifth Floor (Floor 5) - 10 Rooms (Premium/Penthouse)
INSERT INTO Rooms (RoomNumber, RoomTypeID, Floor, Status, Description) VALUES
('501', 4, 5, 'Available', 'Penthouse deluxe room with rooftop access'),
('502', 4, 5, 'Available', 'Penthouse deluxe room panoramic Nile view'),
('503', 4, 5, 'Occupied', 'Penthouse deluxe room presidential'),
('504', 4, 5, 'Available', 'Penthouse deluxe room with private terrace'),
('505', 4, 5, 'Available', 'Penthouse deluxe room executive suite'),
('506', 3, 5, 'Available', 'Fifth floor suite with city view'),
('507', 4, 5, 'Available', 'Penthouse deluxe room royal'),
('508', 4, 5, 'Available', 'Penthouse deluxe room with jacuzzi'),
('509', 4, 5, 'Available', 'Penthouse deluxe room honeymoon suite'),
('510', 4, 5, 'Available', 'Penthouse deluxe room VIP with butler service');

-- ============================================
-- Insert Default Admin User (Password: admin123)
-- ============================================
INSERT INTO Users (Username, PasswordHash, Email, Role) VALUES
('admin', '$2a$11$rBNhFwQ5v5KEy8M.E4O3/.7tK3xHUQvHF5MZ.8Ov8NzSqXQlQdHOm', 'admin@elhotel.eg', 'Admin');

-- ============================================
-- Insert Sample Staff Members
-- ============================================
INSERT INTO Users (Username, PasswordHash, Email, Role) VALUES
('ahmed', '$2a$11$rBNhFwQ5v5KEy8M.E4O3/.7tK3xHUQvHF5MZ.8Ov8NzSqXQlQdHOm', 'ahmed@elhotel.eg', 'Staff'),
('fatma', '$2a$11$rBNhFwQ5v5KEy8M.E4O3/.7tK3xHUQvHF5MZ.8Ov8NzSqXQlQdHOm', 'fatma@elhotel.eg', 'Staff');

INSERT INTO Staff (UserID, FirstName, LastName, Position, Phone, HireDate, Salary, IsActive) VALUES
(2, 'Ahmed', 'Hassan', 'Manager', '01012345678', '2023-01-15', 15000.00, 1),
(3, 'Fatma', 'Mohamed', 'Receptionist', '01098765432', '2023-06-20', 8000.00, 1);

-- ============================================
-- Insert Sample Customers
-- ============================================
INSERT INTO Users (Username, PasswordHash, Email, Role) VALUES
('customer1', '$2a$11$rBNhFwQ5v5KEy8M.E4O3/.7tK3xHUQvHF5MZ.8Ov8NzSqXQlQdHOm', 'omar@gmail.com', 'Customer'),
('customer2', '$2a$11$rBNhFwQ5v5KEy8M.E4O3/.7tK3xHUQvHF5MZ.8Ov8NzSqXQlQdHOm', 'nour@gmail.com', 'Customer');

INSERT INTO Customers (UserID, FirstName, LastName, Phone, Address, IDNumber) VALUES
(4, 'Omar', 'Ali', '01155566677', 'Cairo, Maadi', '29001011234567'),
(5, 'Nour', 'Ibrahim', '01277788899', 'Alexandria, Smouha', '29505051234567');

-- ============================================
-- Insert Sample Bookings
-- ============================================
INSERT INTO Bookings (CustomerID, RoomID, CheckInDate, CheckOutDate, Status, TotalAmount, Notes) VALUES
(1, 3, '2025-12-15', '2025-12-18', 'CheckedIn', 150.00, 'Guest requested extra pillows'),
(1, 10, '2025-12-16', '2025-12-19', 'CheckedIn', 240.00, 'Business traveler'),
(2, 23, '2025-12-17', '2025-12-20', 'CheckedIn', 450.00, 'Anniversary celebration'),
(1, 34, '2025-12-18', '2025-12-21', 'CheckedIn', 600.00, 'VIP guest'),
(2, 43, '2025-12-19', '2025-12-22', 'CheckedIn', 600.00, 'Family vacation'),
(1, 53, '2025-12-20', '2025-12-25', 'CheckedIn', 1000.00, 'Presidential suite booking'),
(2, 1, '2025-12-25', '2025-12-28', 'Confirmed', 150.00, 'New Year reservation'),
(1, 15, '2025-12-26', '2025-12-29', 'Confirmed', 240.00, 'Pending payment'),
(2, 25, '2025-12-27', '2025-12-30', 'Pending', 450.00, 'Waiting for confirmation');

-- ============================================
-- Insert Sample Payments
-- ============================================
INSERT INTO Payments (BookingID, Amount, PaymentMethod, PaymentDate, Status, ReceiptNumber) VALUES
(1, 150.00, 'Card', '2025-12-15 10:30:00', 'Completed', 'RCP-20251215-001'),
(2, 240.00, 'Cash', '2025-12-16 14:45:00', 'Completed', 'RCP-20251216-002'),
(3, 450.00, 'Online', '2025-12-17 09:15:00', 'Completed', 'RCP-20251217-003'),
(4, 600.00, 'Card', '2025-12-18 11:00:00', 'Completed', 'RCP-20251218-004'),
(5, 600.00, 'Cash', '2025-12-19 16:30:00', 'Completed', 'RCP-20251219-005'),
(6, 1000.00, 'Card', '2025-12-20 12:00:00', 'Completed', 'RCP-20251220-006');

-- ============================================
-- Stored Procedures
-- ============================================

-- Get Available Rooms for Date Range
GO
CREATE PROCEDURE sp_GetAvailableRooms
    @CheckInDate DATE,
    @CheckOutDate DATE
AS
BEGIN
    SELECT r.RoomID, r.RoomNumber, rt.TypeName, r.Floor, r.Status, rt.BasePrice, rt.Capacity
    FROM Rooms r
    INNER JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE r.Status = 'Available'
    AND r.RoomID NOT IN (
        SELECT RoomID FROM Bookings
        WHERE Status NOT IN ('Cancelled', 'CheckedOut')
        AND CheckInDate < @CheckOutDate
        AND CheckOutDate > @CheckInDate
    )
END
GO

-- Get Occupancy Report
CREATE PROCEDURE sp_GetOccupancyReport
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SELECT 
        CAST(b.CheckInDate AS DATE) as Date,
        COUNT(*) as TotalBookings,
        SUM(CASE WHEN b.Status = 'CheckedIn' THEN 1 ELSE 0 END) as OccupiedRooms,
        (SELECT COUNT(*) FROM Rooms) as TotalRooms
    FROM Bookings b
    WHERE b.CheckInDate BETWEEN @StartDate AND @EndDate
    GROUP BY CAST(b.CheckInDate AS DATE)
    ORDER BY Date
END
GO

-- Get Revenue Report
CREATE PROCEDURE sp_GetRevenueReport
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SELECT 
        YEAR(p.PaymentDate) as Year,
        MONTH(p.PaymentDate) as Month,
        SUM(p.Amount) as TotalRevenue,
        COUNT(*) as TransactionCount,
        AVG(p.Amount) as AverageTransaction
    FROM Payments p
    WHERE p.Status = 'Completed'
    AND p.PaymentDate BETWEEN @StartDate AND @EndDate
    GROUP BY YEAR(p.PaymentDate), MONTH(p.PaymentDate)
    ORDER BY Year, Month
END
GO

