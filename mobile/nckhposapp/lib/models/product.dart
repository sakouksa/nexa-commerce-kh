class Product {
  final int id;
  final String name;
  final double price;
  final String? sku;
  final String? imageUrl;
  final int stock;

  Product({
    required this.id,
    required this.name,
    required this.price,
    this.sku,
    this.imageUrl,
    this.stock = 0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int,
      name: json['name'] as String? ?? 'Unnamed Product',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      sku: json['sku'] as String?,
      imageUrl: json['image_url'] as String?,
      stock: (json['stock_quantity'] as num?)?.toInt() ?? 0,
    );
  }
}
