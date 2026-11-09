.PHONY: help install dev-api dev-bot dev-storefront dev-admin dev-merchant dev-dashboard dev-reseller dev-telegram dev-pos dev-customerapp test-api docker-up docker-down

help:
	@echo "=========================================================="
	@echo " Nexa Commerce KH (nexa-commerce-kh) Development Commands"
	@echo "=========================================================="
	@echo "  Backend:"
	@echo "    make dev-api          - Run Laravel 13 Core API (backend/nckhcoreapi :8003)"
	@echo "    make dev-bot          - Run Laravel Telegram Bot Worker (backend/nckhtelegrambot)"
	@echo "    make test-api         - Run Core API test suite"
	@echo "    make test-bot         - Run Telegram Bot test suite"
	@echo ""
	@echo "  Web Clients:"
	@echo "    make dev-storefront   - Customer Storefront (webclient/nckhcustomerstorefront :3000)"
	@echo "    make dev-admin        - Admin Portal (webclient/nckhadminportal :3001)"
	@echo "    make dev-merchant     - Merchant Portal (webclient/nckhmerchantportal :3002)"
	@echo "    make dev-reseller     - Reseller Portal (webclient/nckhresellerportal :3005)"
	@echo "    make dev-telegram     - Telegram Mini App (webclient/nckhtelegramminiapp :3006)"
	@echo ""
	@echo "  Mobile:"
	@echo "    make dev-pos          - Mobile POS App (mobile/nckhposapp)"
	@echo "    make dev-customerapp  - Mobile Customer App (mobile/nckhcustomerapp)"
	@echo ""
	@echo "  Infrastructure:"
	@echo "    make docker-up        - Start Postgres, Redis, Mailpit containers"
	@echo "    make docker-down      - Stop docker containers"
	@echo "=========================================================="

dev-api:
	cd backend/nckhcoreapi && php artisan serve --port=8003

dev-bot:
	cd backend/nckhtelegrambot && php artisan telegram:bot:run

test-api:
	cd backend/nckhcoreapi && php artisan test

test-bot:
	cd backend/nckhtelegrambot && php artisan test

dev-storefront:
	cd webclient/nckhcustomerstorefront && npm start

dev-admin:
	cd webclient/nckhadminportal && npm start

dev-merchant:
	cd webclient/nckhmerchantportal && npm start

dev-dashboard: dev-merchant

dev-reseller:
	cd webclient/nckhresellerportal && npm start

dev-telegram:
	cd webclient/nckhtelegramminiapp && npm start

dev-pos:
	cd mobile/nckhposapp && flutter run

dev-customerapp:
	cd mobile/nckhcustomerapp && flutter run

docker-up:
	docker compose up -d

docker-down:
	docker compose down
