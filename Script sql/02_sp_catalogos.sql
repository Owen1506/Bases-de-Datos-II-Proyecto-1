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
