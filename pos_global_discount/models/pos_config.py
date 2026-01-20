# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError


class PosConfig(models.Model):
    _inherit = 'pos.config'

    enable_global_discount = fields.Boolean(
        string='Enable Global Discount',
        help='Allow the cashier to give global discounts (percentage or fixed amount) on the whole order.'
    )
    discount_product_id = fields.Many2one(
        'product.product',
        string='Global Discount Product',
        domain=[('sale_ok', '=', True)],
        help='The product used to apply the global discount on the ticket.'
    )
    max_discount_percentage = fields.Float(
        string='Max Discount %',
        default=100.0,
        help='discount percentage'
    )
    max_discount_amount = fields.Float(
        string='Max Discount Amount',
        default=0.0,
        help='Maximum discount amount allowed (0 = no limit)'
    )

    def open_ui(self):
        for config in self:
            if not self.current_session_id and config.enable_global_discount and not config.discount_product_id:
                raise UserError(_('A discount product is needed to use the Global Discount feature. Go to Point of Sale > Configuration > Settings to set it.'))
        return super().open_ui()

    def _get_special_products(self):
        res = super()._get_special_products()
        return res | self.env['pos.config'].search([]).mapped('discount_product_id')