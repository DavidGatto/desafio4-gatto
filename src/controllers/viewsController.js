const ProductManager = require("../dao/db/product-manager-db.js");
const CartManager = require("../dao/db/cart-manager-db.js");
const manager = new ProductManager();
const managerc = new CartManager();

class ViewsController {
  async getProducts(req, res) {
    try {
      let page = req.query.page;
      const limit = req.query.limit || 2;
      if (!page || isNaN(page)) {
        page = 1;
      }

      const sort = req.query.sort || "";
      const query = req.query.query || "";

      const productsList = await manager.getProducts(limit, page, sort, query);
      console.log(productsList);

      const productsFinal = productsList.docs.map((product) => {
        const { _id, ...prod } = product.toObject();
        return prod;
      });

      if (!req.session.login) {
        return res.redirect("/");
      }

      res.render("products", {
        products: productsFinal,
        hasPrevPage: productsList.hasPrevPage,
        hasNextPage: productsList.hasNextPage,
        prevPage: productsList.prevPage,
        nextPage: productsList.nextPage,
        currentPage: productsList.page,
        totalPages: productsList.totalPages,
        user: req.session.user,
      });
    } catch (error) {
      console.error("Error al obtener productos", error);
      res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }

  async getProductById(req, res) {
    try {
      const prodId = req.params.prodId;

      const product = await prodService.getProductById(prodId);

      res.render("productDetail", {
        title: "Product Detail",
        product,
        user: req.session.user,
      });
    } catch (error) {
      console.error("Error al encontrar los detalles", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  }

  async getCartById(req, res) {
    try {
      const cartId = req.params.cid;
      const { products } = await managerc.getCartById(cartId);

      const productsWithStringsIds = products.map((product) => ({
        quantity: product.quantity,
        _id: product._id.toString(),
      }));

      res.render("carts", { cartId: cartId, products: productsWithStringsIds });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    if (req.session.login) {
      return res.redirect("/api/products");
    }

    res.render("login");
  }

  async register(req, res) {
    if (req.session.login) {
      return res.redirect("/api/products");
    }
    res.render("register");
  }
}
module.exports = ViewsController;
