from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mssql+pyodbc://@AMAD-IRFAN/ProductDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    price = db.Column(db.Float)
    description = db.Column(db.String(500))
    category = db.Column(db.String(50))
    image = db.Column(db.String(200))

    def __init__(self, title, price, description, category, image):
        self.title = title
        self.price = price
        self.description = description
        self.category = category
        self.image = image


class ProductSchema(ma.Schema):
    class Meta:
        fields = ("id", "title", "price", "description", "category", "image")


product_schema = ProductSchema()
products_schema = ProductSchema(many=True)


@app.route("/product", methods=["POST"])
def add_product():
    try:
        data = request.get_json()  # Assuming you're sending JSON data in the request
        new_product = Product(
            title=data["title"],
            price=data["price"],
            description=data["description"],
            category=data["category"],
            image=data["image"],
        )
        db.session.add(new_product)
        db.session.commit()
        return (
            jsonify({"status": "ok", "message": "Product inserted successfully"}),
            201,
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/products", methods=["GET"])
def get_products():
    all_products = Product.query.all()
    result = products_schema.dump(all_products)
    return jsonify(result)


@app.route("/product/<id>", methods=["GET"])
def get_product(id):
    product = Product.query.get(id)
    return product_schema.jsonify(product)


@app.route("/product/<id>", methods=["PUT"])
def update_product(id):
    try:
        product = Product.query.get(id)
        title = request.json["title"]
        price = request.json["price"]
        description = request.json["description"]
        category = request.json["category"]
        image = request.json["image"]
        product.title = title
        product.price = price
        product.description = description
        product.category = category
        product.image = image
        db.session.commit()
        return (
            jsonify({"status": "ok", "message": "Product updated successfully"}),
            200,
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/product/<id>", methods=["DELETE"])
def delete_product(id):
    try:
        product = Product.query.get(id)
        db.session.delete(product)
        db.session.commit()
        return (
            jsonify({"status": "ok", "message": "Product deleted successfully"}),
            200,
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/", methods=["GET"])
def init():
    return jsonify("welcome to my products api services")


if __name__ == "__main__":
    app.run(debug=True, port=3003)
