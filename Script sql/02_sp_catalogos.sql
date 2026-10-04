-- 02_sp_catalogos.sql
-- SP para llenar los selects de los filtros
USE WideWorldImporters;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Catalogo_CategoriasCliente
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CustomerCategoryID AS CategoriaID, CustomerCategoryName AS Categoria
    FROM syn.CustomerCategories
    ORDER BY CustomerCategoryName;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Catalogo_MetodosEntrega
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DeliveryMethodID AS MetodoEntregaID, DeliveryMethodName AS MetodoEntrega
    FROM syn.DeliveryMethods
    ORDER BY DeliveryMethodName;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Catalogo_GruposCompra
AS
BEGIN
    SET NOCOUNT ON;

    SELECT BuyingGroupID AS GrupoCompraID, BuyingGroupName AS GrupoCompra
    FROM syn.BuyingGroups
    ORDER BY BuyingGroupName;
END;
GO

-- Los siguientes son buscadores para el formulario de clientes.
-- Como hay muchas ciudades y personas, se devuelven solo las primeras 20 que coinciden.

CREATE OR ALTER PROCEDURE dbo.usp_Catalogo_BuscarCiudades
    @Texto NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 20 ci.CityID AS CiudadID,
           ci.CityName + ', ' + sp.StateProvinceName AS Ciudad
    FROM syn.Cities ci
    JOIN syn.StateProvinces sp ON sp.StateProvinceID = ci.StateProvinceID
    WHERE ci.CityName LIKE @Texto + '%'
    ORDER BY ci.CityName, sp.StateProvinceName;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Catalogo_BuscarPersonas
    @Texto NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 20 PersonID AS PersonaID, FullName AS Persona
    FROM syn.People
    WHERE FullName LIKE '%' + @Texto + '%'
    ORDER BY FullName;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Catalogo_BuscarClientes
    @Texto NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 20 CustomerID AS ClienteID, CustomerName AS Cliente
    FROM syn.Customers
    WHERE CustomerName LIKE '%' + @Texto + '%'
    ORDER BY CustomerName;
END;
GO
