-- 03_sp_clientes.sql
-- SP del modulo de clientes
USE WideWorldImporters;
GO

-- Lista de clientes, los filtros son opcionales
CREATE OR ALTER PROCEDURE dbo.usp_Clientes_Listar
    @Nombre NVARCHAR(100) = NULL,
    @CategoriaID INT = NULL,
    @MetodoEntregaID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- si viene vacio es como no filtrar
    IF @Nombre = '' SET @Nombre = NULL;

    SELECT c.CustomerID AS ClienteID,
           c.CustomerName AS Nombre,
           cc.CustomerCategoryName AS Categoria,
           dm.DeliveryMethodName AS MetodoEntrega
    FROM syn.Customers c
    JOIN syn.CustomerCategories cc ON cc.CustomerCategoryID = c.CustomerCategoryID
    JOIN syn.DeliveryMethods dm ON dm.DeliveryMethodID = c.DeliveryMethodID
    WHERE (@Nombre IS NULL OR c.CustomerName LIKE '%' + @Nombre + '%')
      AND (@CategoriaID IS NULL OR c.CustomerCategoryID = @CategoriaID)
      AND (@MetodoEntregaID IS NULL OR c.DeliveryMethodID = @MetodoEntregaID)
    ORDER BY c.CustomerName;
END;
GO

-- Detalle de un cliente
CREATE OR ALTER PROCEDURE dbo.usp_Clientes_Detalle
    @ClienteID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.CustomerID AS ClienteID,
           c.CustomerName AS Nombre,
           cc.CustomerCategoryName AS Categoria,
           bg.BuyingGroupName AS GrupoCompra,
           pc.FullName AS ContactoPrimario,
           pc.PhoneNumber AS ContactoPrimarioTelefono,
           pc.EmailAddress AS ContactoPrimarioCorreo,
           ac.FullName AS ContactoAlternativo,
           ac.PhoneNumber AS ContactoAlternativoTelefono,
           ac.EmailAddress AS ContactoAlternativoCorreo,
           c.BillToCustomerID AS ClienteFacturarID,
           bt.CustomerName AS ClienteFacturar,
           dm.DeliveryMethodName AS MetodoEntrega,
           dc.CityName AS CiudadEntrega,
           dsp.StateProvinceName AS ProvinciaEntrega,
           c.DeliveryPostalCode AS CodigoPostalEntrega,
           c.PhoneNumber AS Telefono,
           c.FaxNumber AS Fax,
           c.PaymentDays AS DiasPago,
           c.WebsiteURL AS SitioWeb,
           c.DeliveryAddressLine1 AS DireccionEntrega1,
           c.DeliveryAddressLine2 AS DireccionEntrega2,
           c.PostalAddressLine1 AS DireccionPostal1,
           c.PostalAddressLine2 AS DireccionPostal2,
           pci.CityName AS CiudadPostal,
           c.PostalPostalCode AS CodigoPostalPostal,
           c.DeliveryLocation.Lat AS Latitud,
           c.DeliveryLocation.Long AS Longitud
    FROM syn.Customers c
    JOIN syn.CustomerCategories cc ON cc.CustomerCategoryID = c.CustomerCategoryID
    JOIN syn.DeliveryMethods dm ON dm.DeliveryMethodID = c.DeliveryMethodID
    JOIN syn.People pc ON pc.PersonID = c.PrimaryContactPersonID
    JOIN syn.Customers bt ON bt.CustomerID = c.BillToCustomerID
    JOIN syn.Cities dc ON dc.CityID = c.DeliveryCityID
    JOIN syn.StateProvinces dsp ON dsp.StateProvinceID = dc.StateProvinceID
    JOIN syn.Cities pci ON pci.CityID = c.PostalCityID
    LEFT JOIN syn.BuyingGroups bg ON bg.BuyingGroupID = c.BuyingGroupID
    LEFT JOIN syn.People ac ON ac.PersonID = c.AlternateContactPersonID
    WHERE c.CustomerID = @ClienteID;
END;
GO

-- SP Eliminar
CREATE OR ALTER PROCEDURE dbo.usp_Clientes_Eliminar
    @ClienteID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM syn.Customers
            WHERE CustomerID = @ClienteID
        )
        BEGIN
            THROW 50001, 'El cliente indicado no existe.', 1;
        END;

        DELETE FROM syn.Customers
        WHERE CustomerID = @ClienteID;

        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF ERROR_NUMBER() = 547
        BEGIN
            THROW 50002, 'No se puede eliminar el cliente porque tiene registros asociados.', 1;
        END;

        THROW;
    END CATCH;
END;
GO
-- SP Modificar/Actualizar
CREATE OR ALTER PROCEDURE dbo.usp_Clientes_Actualizar
    @ClienteID INT,
    @Nombre NVARCHAR(100),
    @ClienteFacturarID INT,
    @CategoriaID INT,
    @GrupoCompraID INT = NULL,
    @ContactoPrimarioID INT,
    @ContactoAlternativoID INT = NULL,
    @MetodoEntregaID INT,
    @CiudadEntregaID INT,
    @CiudadPostalID INT,
    @DiasPago INT,
    @Telefono NVARCHAR(20),
    @Fax NVARCHAR(20),
    @SitioWeb NVARCHAR(256),
    @DireccionEntrega1 NVARCHAR(60),
    @DireccionEntrega2 NVARCHAR(60) = NULL,
    @CodigoPostalEntrega NVARCHAR(10),
    @DireccionPostal1 NVARCHAR(60),
    @DireccionPostal2 NVARCHAR(60) = NULL,
    @CodigoPostalPostal NVARCHAR(10),
    @Latitud FLOAT = NULL,
    @Longitud FLOAT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM syn.Customers
            WHERE CustomerID = @ClienteID
        )
        BEGIN
            THROW 50001, 'El cliente indicado no existe.', 1;
        END;

        UPDATE syn.Customers
        SET
            CustomerName = @Nombre,
            BillToCustomerID = @ClienteFacturarID,
            CustomerCategoryID = @CategoriaID,
            BuyingGroupID = @GrupoCompraID,
            PrimaryContactPersonID = @ContactoPrimarioID,
            AlternateContactPersonID = @ContactoAlternativoID,
            DeliveryMethodID = @MetodoEntregaID,
            DeliveryCityID = @CiudadEntregaID,
            PostalCityID = @CiudadPostalID,
            PaymentDays = @DiasPago,
            PhoneNumber = @Telefono,
            FaxNumber = @Fax,
            WebsiteURL = @SitioWeb,
            DeliveryAddressLine1 = @DireccionEntrega1,
            DeliveryAddressLine2 = @DireccionEntrega2,
            DeliveryPostalCode = @CodigoPostalEntrega,
            DeliveryLocation = CASE
                WHEN @Latitud IS NOT NULL AND @Longitud IS NOT NULL
                THEN geography::Point(@Latitud, @Longitud, 4326)
                ELSE NULL
            END,
            PostalAddressLine1 = @DireccionPostal1,
            PostalAddressLine2 = @DireccionPostal2,
            PostalPostalCode = @CodigoPostalPostal,
            LastEditedBy = 1
        WHERE CustomerID = @ClienteID;

        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
-- SP Insertar
CREATE OR ALTER PROCEDURE dbo.usp_Clientes_Insertar
    @Nombre NVARCHAR(100),
    @ClienteFacturarID INT,
    @CategoriaID INT,
    @GrupoCompraID INT = NULL,
    @ContactoPrimarioID INT,
    @ContactoAlternativoID INT = NULL,
    @MetodoEntregaID INT,
    @CiudadEntregaID INT,
    @CiudadPostalID INT,
    @DiasPago INT,
    @Telefono NVARCHAR(20),
    @Fax NVARCHAR(20),
    @SitioWeb NVARCHAR(256),
    @DireccionEntrega1 NVARCHAR(60),
    @DireccionEntrega2 NVARCHAR(60) = NULL,
    @CodigoPostalEntrega NVARCHAR(10),
    @DireccionPostal1 NVARCHAR(60),
    @DireccionPostal2 NVARCHAR(60) = NULL,
    @CodigoPostalPostal NVARCHAR(10),
    @Latitud FLOAT = NULL,
    @Longitud FLOAT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NuevoCliente TABLE (
        ClienteID INT
    );

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO syn.Customers (
            CustomerName,
            BillToCustomerID,
            CustomerCategoryID,
            BuyingGroupID,
            PrimaryContactPersonID,
            AlternateContactPersonID,
            DeliveryMethodID,
            DeliveryCityID,
            PostalCityID,
            AccountOpenedDate,
            StandardDiscountPercentage,
            IsStatementSent,
            IsOnCreditHold,
            PaymentDays,
            PhoneNumber,
            FaxNumber,
            WebsiteURL,
            DeliveryAddressLine1,
            DeliveryAddressLine2,
            DeliveryPostalCode,
            DeliveryLocation,
            PostalAddressLine1,
            PostalAddressLine2,
            PostalPostalCode,
            LastEditedBy
        )
        OUTPUT INSERTED.CustomerID INTO @NuevoCliente
        VALUES (
            @Nombre,
            @ClienteFacturarID,
            @CategoriaID,
            @GrupoCompraID,
            @ContactoPrimarioID,
            @ContactoAlternativoID,
            @MetodoEntregaID,
            @CiudadEntregaID,
            @CiudadPostalID,
            CAST(GETDATE() AS DATE),
            0,
            0,
            0,
            @DiasPago,
            @Telefono,
            @Fax,
            @SitioWeb,
            @DireccionEntrega1,
            @DireccionEntrega2,
            @CodigoPostalEntrega,
            CASE
                WHEN @Latitud IS NOT NULL AND @Longitud IS NOT NULL
                THEN geography::Point(@Latitud, @Longitud, 4326)
                ELSE NULL
            END,
            @DireccionPostal1,
            @DireccionPostal2,
            @CodigoPostalPostal,
            1
        );

        COMMIT TRANSACTION;

        SELECT ClienteID
        FROM @NuevoCliente;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO