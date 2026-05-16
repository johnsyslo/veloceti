.PHONY: help install dev build preview check check-watch lint format clean prepare

help:
	@echo "Portfolio Makefile targets:"
	@echo "  install       - Install dependencies"
	@echo "  dev           - Start development server"
	@echo "  build         - Build for production"
	@echo "  preview       - Preview production build"
	@echo "  check         - Run type checking"
	@echo "  lint          - Check code style and formatting"
	@echo "  format        - Format code with Prettier"
	@echo "  clean         - Remove build artifacts and node_modules"
	@echo "  prepare       - Run SvelteKit sync"

install:
	npm install

dev:
	docker compose up -d
	npm run dev

build:
	npm run build

preview:
	docker compose up
	npm run preview

check:
	npm run check

lint:
	npm run lint

format:
	npm run format

prepare:
	npm run prepare

clean:
	rm -rf .svelte-kit dist build
	rm -rf node_modules package-lock.json
