import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/product.dart';
import '../models/cart_item.dart';
import '../config.dart';

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final List<Product> _products = [
    Product(
        id: 1,
        name: 'Angkor Beer Can 330ml',
        price: 0.75,
        sku: 'ANG-CAN-330',
        stock: 120),
    Product(
        id: 2,
        name: 'Vital Mineral Water 500ml',
        price: 0.35,
        sku: 'VIT-500',
        stock: 250),
    Product(
        id: 3,
        name: 'Iced Latte (Large)',
        price: 2.25,
        sku: 'COF-LAT-LG',
        stock: 80),
    Product(
        id: 4,
        name: 'Num Pang Pate Sandwich',
        price: 1.50,
        sku: 'FD-NP-PATE',
        stock: 45),
    Product(
        id: 5,
        name: 'Red Bull Energy 250ml',
        price: 0.85,
        sku: 'RB-250',
        stock: 95),
  ];

  final Map<int, CartItem> _cart = {};

  void _addToCart(Product product) {
    setState(() {
      if (_cart.containsKey(product.id)) {
        _cart[product.id]!.quantity += 1;
      } else {
        _cart[product.id] = CartItem(product: product, quantity: 1);
      }
    });
  }

  void _removeFromCart(Product product) {
    setState(() {
      if (_cart.containsKey(product.id)) {
        if (_cart[product.id]!.quantity > 1) {
          _cart[product.id]!.quantity -= 1;
        } else {
          _cart.remove(product.id);
        }
      }
    });
  }

  void _clearCart() {
    setState(() {
      _cart.clear();
    });
  }

  double get _subtotal =>
      _cart.values.fold(0.0, (sum, item) => sum + item.subtotal);
  double get _subtotalKhr => _subtotal * AppConfig.khrExchangeRate;

  void _showCheckoutDialog() {
    if (_cart.isEmpty) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Complete Sale / Checkout'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
                'Items: ${_cart.values.fold(0, (sum, item) => sum + item.quantity)}'),
            const SizedBox(height: 8),
            Text(
              'Total: \$${_subtotal.toStringAsFixed(2)} USD',
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.indigo),
            ),
            Text(
              'KHR: ${NumberFormat('#,###').format(_subtotalKhr)} ៛',
              style: const TextStyle(fontSize: 16, color: Colors.black87),
            ),
            const Divider(height: 24),
            const Text('Choose Payment Method:',
                style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    icon: const Icon(Icons.money),
                    label: const Text('Cash'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _completeSale('Cash');
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent),
                    icon: const Icon(Icons.qr_code_2),
                    label: const Text('KHQR'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _completeSale('Bakong KHQR');
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _completeSale(String method) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Sale completed via $method! Amount: \$${_subtotal.toStringAsFixed(2)}'),
        backgroundColor: Colors.green,
      ),
    );
    _clearCart();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat =
        NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final khrFormat = NumberFormat('#,###');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nexa Commerce POS (Cambodia)'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {},
            tooltip: 'Sync Products',
          ),
          if (_cart.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: _clearCart,
              tooltip: 'Clear Cart',
            ),
        ],
      ),
      body: Row(
        children: [
          // Left: Product Catalog
          Expanded(
            flex: 3,
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: _products.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final product = _products[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.indigo.shade50,
                    child: Text(
                      product.name.substring(0, 1),
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, color: Colors.indigo),
                    ),
                  ),
                  title: Text(product.name,
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(
                      'SKU: ${product.sku ?? '-'} • Stock: ${product.stock}'),
                  trailing: Text(
                    currencyFormat.format(product.price),
                    style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.indigo),
                  ),
                  onTap: () => _addToCart(product),
                );
              },
            ),
          ),
          const VerticalDivider(width: 1),
          // Right: Cart Summary
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.grey.shade50,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 14),
                    color: Colors.indigo.shade50,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            'Order',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text('${_cart.length} items',
                            style: TextStyle(color: Colors.grey.shade700)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: _cart.isEmpty
                        ? const Center(
                            child: Text(
                              'Cart is empty.\nTap products to add.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : ListView.builder(
                            itemCount: _cart.length,
                            itemBuilder: (context, index) {
                              final item = _cart.values.elementAt(index);
                              return ListTile(
                                dense: true,
                                title: Text(item.product.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis),
                                subtitle: Text(
                                    '\$${item.product.price.toStringAsFixed(2)} x ${item.quantity}'),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(
                                          Icons.remove_circle_outline,
                                          size: 20),
                                      onPressed: () =>
                                          _removeFromCart(item.product),
                                    ),
                                    Text('${item.quantity}',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold)),
                                    IconButton(
                                      icon: const Icon(Icons.add_circle_outline,
                                          size: 20),
                                      onPressed: () => _addToCart(item.product),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                  // Bottom Checkout Bar
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border:
                          Border(top: BorderSide(color: Colors.grey.shade200)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Subtotal:',
                                style: TextStyle(fontSize: 14)),
                            Text(currencyFormat.format(_subtotal),
                                style: const TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('KHR Equivalent:',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey)),
                            Text('${khrFormat.format(_subtotalKhr)} ៛',
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.indigo,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: _cart.isEmpty ? null : _showCheckoutDialog,
                          child: const Text('Charge & Pay',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
