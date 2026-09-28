import 'package:flutter_test/flutter_test.dart';
import 'package:nckhposapp/main.dart';

void main() {
  testWidgets('POS smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const NckhPosApp());
    expect(find.text('Nexa Commerce POS (Cambodia)'), findsOneWidget);
  });
}
