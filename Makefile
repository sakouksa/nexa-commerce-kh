.PHONY: help install dev-api dev-storefront dev-admin dev-dashboard dev-reseller dev-telegram dev-bot test-api

help:
	@echo "=========================================================="
	@echo " MiniStore KH Monorepo Development Commands"
	@echo "=========================================================="
	@echo "  make dev-api         - Run Laravel 13 backend (port 8000)"
	@echo "  make dev-storefront  - Run customer storefront (port 3000)"
	@echo "  make dev-admin       - Run platform admin (port 3001)"
	@echo "  make dev-dashboard   - Run shop owner dashboard (port 3002)"
	@echo "  make dev-reseller    - Run reseller dashboard (port 3005)"
	@echo "  make dev-telegram    - Run Telegram Mini App (port 3006)"
	@echo "  make dev-bot         - Run Telegram bot worker"
	@echo "  make test-api        - Run Laravel PHPUnit feature tests"
	@echo "=========================================================="

dev-api:
	cd apps/api && php artisan serve --port=8000

dev-storefront:
	cd apps/web/storefront && npm start

dev-admin:
	cd apps/web/admin && npm start

dev-dashboard:
	cd apps/web/dashboard && npm start

dev-reseller:
	cd apps/web/reseller && npm start

dev-telegram:
	cd apps/web/telegram-mini-app && npm start

dev-bot:
	cd apps/workers/telegram-bot && python bot_worker.py

test-api:
	cd apps/api && php artisan test
