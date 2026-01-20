/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { NumberPopup } from "@point_of_sale/app/components/popups/number_popup/number_popup";
import { SelectionPopup } from "@point_of_sale/app/components/popups/selection_popup/selection_popup";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { patch } from "@web/core/utils/patch";

patch(ControlButtons.prototype, {
    async clickGlobalDiscount() {
        this.dialog.add(SelectionPopup, {
            title: _t("Select Discount Type"),
            list: [
                { id: 1, label: _t("Percentage"), item: "percentage" },
                { id: 2, label: _t("Fixed Amount"), item: "fixed" },
            ],
            getPayload: (selectedType) => {
                if (selectedType === "percentage") {
                    this.askDiscountPercentage();
                } else if (selectedType === "fixed") {
                    this.askDiscountAmount();
                }
            },
        });
    },

    async askDiscountPercentage() {
        this.dialog.add(NumberPopup, {
            title: _t("Discount Percentage"),
            startingValue: 0,
            getPayload: (num) => {
                const percent = Math.max(
                    0,
                    Math.min(100, this.env.utils.parseValidFloat(num.toString()))
                );
                this.applyGlobalDiscount(percent, "percentage");
            },
        });
    },

    async askDiscountAmount() {
        this.dialog.add(NumberPopup, {
            title: _t("Discount Amount"),
            startingValue: 0,
            getPayload: (num) => {
                const amount = Math.max(0, this.env.utils.parseValidFloat(num.toString()));
                this.applyGlobalDiscount(amount, "fixed");
            },
        });
    },

    async applyGlobalDiscount(value, discountType) {
    const order = this.pos.getOrder();
    if (!order) return;

    const config = this.pos.config;
    const discountProduct = config.discount_product_id;

    if (!discountProduct || !discountProduct.id) {
        this.dialog.add(AlertDialog, {
            title: _t("No Discount Product"),
            body: _t(
                "A discount product is needed to use the Global Discount feature. " +
                "Go to Point of Sale > Configuration > Settings to set it."
            ),
        });
        return;
    }


        const discountLines = order.lines.filter(
            (line) => line.product_id.id === discountProduct
        );
        for (const line of discountLines) {
            line.delete();
        }

        const subtotal = order.getTotalCost();
        let discountAmount = 0;

        if (discountType === "percentage") {
            if (config.max_discount_percentage && value > config.max_discount_percentage) {
                this.dialog.add(AlertDialog, {
                    title: _t("Discount Limit Exceeded"),
                    body: _t("Maximum discount is %s%%", config.max_discount_percentage),
                });
                return;
            }
            discountAmount = (subtotal * value) / 100;
        } else if (discountType === "fixed") {
            if (config.max_discount_amount > 0 && value > config.max_discount_amount) {
                this.dialog.add(AlertDialog, {
                    title: _t("Discount Limit Exceeded"),
                    body: _t("Maximum discount is %s", this.env.utils.formatCurrency(config.max_discount_amount)),
                });
                return;
            }
            discountAmount = value;
        }

        if (discountAmount > 0) {
            const description =
                discountType === "percentage"
                    ? `Global Discount (${value}%)`
                    : `Global Discount (${this.env.utils.formatCurrency(value)})`;

            this.pos.models["pos.order.line"].create({
                order_id: order,
                product_id: discountProduct,
                price_unit: -discountAmount,
                qty: 1,
                full_product_name: description,
            });

            // Show success notification
            this.notification.add(
                _t("Global discount applied successfully"),
                { type: "success" }
            );
        }
    },
});