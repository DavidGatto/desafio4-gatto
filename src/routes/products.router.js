const express = require("express");
const router = express.Router();

const productManager = require("../dao/db/product-manager-db.js");
const manager = new productManager();

router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    let products;

    if (query) {
      products = await manager.getProductsByQuery(query);
    } else {
      products = await manager.getProducts();
    }

    if (sort === "ascendente") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "descendente") {
      products.sort((a, b) => b.price - a.price);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pageProducts = products.slice(startIndex, endIndex);

    res.json(pageProducts);
  } catch (error) {
    console.error("Error al obtener productos", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Ruta para obtener un producto por su id
router.get("/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;

    const search = await manager.getProductById(pid);

    if (search) {
      // Si se encuentra el producto lo devuelve
      return res.send(search);
    } else {
      // Si no se encuentra el producto devuelve un mensaje de error
      return res.send("No se encontró el producto");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error interno del servidor");
  }
});

// Ruta para agregar un nuevo producto
router.post("/products", async (req, res) => {
  try {
    const productReq = req.body;
    const product = await manager.addProduct(productReq);
    res
      .status(201)
      .json({ message: "Producto agregado correctamente", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar un producto existente por su id
router.put("/products/:pid", async (req, res) => {
  try {
    const id = req.params.pid;
    const productUpdate = await manager.updateProduct(id, req.body);
    res.status(200).json({
      message: "Producto actualizado correctamente",
      product: productUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un producto por su id
router.delete("/products/:pid", async (req, res) => {
  try {
    const id = req.params.pid;
    const deletedProduct = await manager.deleteProductById(id);
    res.status(200).json({
      message: "Producto eliminado correctamente",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
