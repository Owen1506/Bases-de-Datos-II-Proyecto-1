USE WideWorldImporters;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Inventario_Listar
    @Nombre NVARCHAR(100) = NULL,
    @GrupoID INT = NULL,
    @Pagina INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF @Nombre = ''
        SET @Nombre = NULL;

    IF @Pagina < 1
        SET @Pagina = 1;

    DECLARE @TamanoPagina INT = 10;

    SELECT
        si.StockItemID AS ProductoID,
        si.StockItemName AS Nombre,
        STRING_AGG(sg.StockGroupName, ', ') WITHIN GROUP (ORDER BY sg.StockGroupName) AS Grupo,
        h.QuantityOnHand AS CantidadDisponible,
        COUNT(*) OVER() AS TotalRegistros
    FROM syn.StockItems si
    JOIN syn.StockItemHoldings h
        ON h.StockItemID = si.StockItemID
    LEFT JOIN syn.StockItemStockGroups sisg
        ON sisg.StockItemID = si.StockItemID
    LEFT JOIN syn.StockGroups sg
        ON sg.StockGroupID = sisg.StockGroupID
    WHERE
        (@Nombre IS NULL OR si.StockItemName LIKE '%' + @Nombre + '%')
        AND (
            @GrupoID IS NULL
            OR EXISTS (
                SELECT 1
                FROM syn.StockItemStockGroups x
                WHERE x.StockItemID = si.StockItemID
                  AND x.StockGroupID = @GrupoID
            )
        )
    GROUP BY
        si.StockItemID,
        si.StockItemName,
        h.QuantityOnHand
    ORDER BY si.StockItemName ASC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Inventario_Detalle
    @ProductoID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockItemID AS ProductoID,
        si.StockItemName AS Nombre,

        si.SupplierID AS ProveedorID,
        s.SupplierName AS Proveedor,

        STRING_AGG(sg.StockGroupName, ', ') WITHIN GROUP (ORDER BY sg.StockGroupName) AS Grupo,

        c.ColorName AS Color,

        up.PackageTypeName AS UnidadEmpaquetamiento,
        op.PackageTypeName AS Empaquetamiento,

        si.QuantityPerOuter AS CantidadEmpaquetamiento,

        si.Brand AS Marca,
        si.Size AS Tamano,

        si.TaxRate AS Impuesto,
        si.UnitPrice AS PrecioUnitario,
        si.RecommendedRetailPrice AS PrecioVenta,

        si.TypicalWeightPerUnit AS Peso,
        si.SearchDetails AS PalabrasClave,

        h.QuantityOnHand AS CantidadDisponible,
        h.BinLocation AS Ubicacion

    FROM syn.StockItems si
    JOIN syn.Suppliers s
        ON s.SupplierID = si.SupplierID
    LEFT JOIN syn.Colors c
        ON c.ColorID = si.ColorID
    JOIN syn.PackageTypes up
        ON up.PackageTypeID = si.UnitPackageID
    JOIN syn.PackageTypes op
        ON op.PackageTypeID = si.OuterPackageID
    JOIN syn.StockItemHoldings h
        ON h.StockItemID = si.StockItemID
    LEFT JOIN syn.StockItemStockGroups sisg
        ON sisg.StockItemID = si.StockItemID
    LEFT JOIN syn.StockGroups sg
        ON sg.StockGroupID = sisg.StockGroupID
    WHERE si.StockItemID = @ProductoID
    GROUP BY
        si.StockItemID,
        si.StockItemName,
        si.SupplierID,
        s.SupplierName,
        c.ColorName,
        up.PackageTypeName,
        op.PackageTypeName,
        si.QuantityPerOuter,
        si.Brand,
        si.Size,
        si.TaxRate,
        si.UnitPrice,
        si.RecommendedRetailPrice,
        si.TypicalWeightPerUnit,
        si.SearchDetails,
        h.QuantityOnHand,
        h.BinLocation;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Inventario_Insertar
    @Nombre NVARCHAR(100),
    @ProveedorID INT,
    @GrupoID INT,
    @ColorID INT = NULL,
    @UnidadEmpaqueID INT,
    @EmpaqueExteriorID INT,
    @CantidadEmpaquetamiento INT,
    @Marca NVARCHAR(50) = NULL,
    @Tamano NVARCHAR(20) = NULL,
    @Impuesto DECIMAL(18,3),
    @PrecioUnitario DECIMAL(18,2),
    @PrecioVenta DECIMAL(18,2) = NULL,
    @Peso DECIMAL(18,3),
    @CantidadDisponible INT,
    @Ubicacion NVARCHAR(20),
    @DiasEntrega INT = 1,
    @EsRefrigerado BIT = 0,
    @CodigoBarras NVARCHAR(50) = NULL,
    @ComentariosMarketing NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NuevoProducto TABLE (
        ProductoID INT
    );

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO syn.StockItems (
            StockItemName,
            SupplierID,
            ColorID,
            UnitPackageID,
            OuterPackageID,
            Brand,
            Size,
            LeadTimeDays,
            QuantityPerOuter,
            IsChillerStock,
            Barcode,
            TaxRate,
            UnitPrice,
            RecommendedRetailPrice,
            TypicalWeightPerUnit,
            MarketingComments,
            LastEditedBy
        )
        OUTPUT INSERTED.StockItemID INTO @NuevoProducto
        VALUES (
            @Nombre,
            @ProveedorID,
            @ColorID,
            @UnidadEmpaqueID,
            @EmpaqueExteriorID,
            @Marca,
            @Tamano,
            @DiasEntrega,
            @CantidadEmpaquetamiento,
            @EsRefrigerado,
            @CodigoBarras,
            @Impuesto,
            @PrecioUnitario,
            @PrecioVenta,
            @Peso,
            @ComentariosMarketing,
            1
        );

        DECLARE @ProductoID INT;

        SELECT @ProductoID = ProductoID
        FROM @NuevoProducto;

        INSERT INTO syn.StockItemHoldings (
            StockItemID,
            QuantityOnHand,
            BinLocation,
            LastStocktakeQuantity,
            LastCostPrice,
            ReorderLevel,
            TargetStockLevel,
            LastEditedBy
        )
        VALUES (
            @ProductoID,
            @CantidadDisponible,
            @Ubicacion,
            @CantidadDisponible,
            @PrecioUnitario,
            0,
            @CantidadDisponible,
            1
        );

        INSERT INTO syn.StockItemStockGroups (
            StockItemID,
            StockGroupID,
            LastEditedBy
        )
        VALUES (
            @ProductoID,
            @GrupoID,
            1
        );

        COMMIT TRANSACTION;

        SELECT ProductoID
        FROM @NuevoProducto;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Inventario_Actualizar
    @ProductoID INT,
    @Nombre NVARCHAR(100),
    @ProveedorID INT,
    @GrupoID INT,
    @ColorID INT = NULL,
    @UnidadEmpaqueID INT,
    @EmpaqueExteriorID INT,
    @CantidadEmpaquetamiento INT,
    @Marca NVARCHAR(50) = NULL,
    @Tamano NVARCHAR(20) = NULL,
    @Impuesto DECIMAL(18,3),
    @PrecioUnitario DECIMAL(18,2),
    @PrecioVenta DECIMAL(18,2) = NULL,
    @Peso DECIMAL(18,3),
    @CantidadDisponible INT,
    @Ubicacion NVARCHAR(20),
    @DiasEntrega INT = 1,
    @EsRefrigerado BIT = 0,
    @CodigoBarras NVARCHAR(50) = NULL,
    @ComentariosMarketing NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM syn.StockItems
            WHERE StockItemID = @ProductoID
        )
        BEGIN
            THROW 50001, 'El producto indicado no existe.', 1;
        END;

        UPDATE syn.StockItems
        SET
            StockItemName = @Nombre,
            SupplierID = @ProveedorID,
            ColorID = @ColorID,
            UnitPackageID = @UnidadEmpaqueID,
            OuterPackageID = @EmpaqueExteriorID,
            Brand = @Marca,
            Size = @Tamano,
            LeadTimeDays = @DiasEntrega,
            QuantityPerOuter = @CantidadEmpaquetamiento,
            IsChillerStock = @EsRefrigerado,
            Barcode = @CodigoBarras,
            TaxRate = @Impuesto,
            UnitPrice = @PrecioUnitario,
            RecommendedRetailPrice = @PrecioVenta,
            TypicalWeightPerUnit = @Peso,
            MarketingComments = @ComentariosMarketing,
            LastEditedBy = 1
        WHERE StockItemID = @ProductoID;

        UPDATE syn.StockItemHoldings
        SET
            QuantityOnHand = @CantidadDisponible,
            BinLocation = @Ubicacion,
            LastEditedBy = 1
        WHERE StockItemID = @ProductoID;

        DELETE FROM syn.StockItemStockGroups
        WHERE StockItemID = @ProductoID;

        INSERT INTO syn.StockItemStockGroups (
            StockItemID,
            StockGroupID,
            LastEditedBy
        )
        VALUES (
            @ProductoID,
            @GrupoID,
            1
        );

        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Inventario_Eliminar
    @ProductoID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM syn.StockItems
            WHERE StockItemID = @ProductoID
        )
        BEGIN
            THROW 50001, 'El producto indicado no existe.', 1;
        END;

        DELETE FROM syn.StockItemStockGroups
        WHERE StockItemID = @ProductoID;

        DELETE FROM syn.StockItemHoldings
        WHERE StockItemID = @ProductoID;

        DELETE FROM syn.StockItems
        WHERE StockItemID = @ProductoID;

        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF ERROR_NUMBER() = 547
        BEGIN
            THROW 50002, 'No se puede eliminar el producto porque tiene registros asociados.', 1;
        END;

        THROW;
    END CATCH;
END;
GO
