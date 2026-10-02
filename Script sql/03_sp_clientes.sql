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
