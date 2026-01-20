from odoo import models, fields


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    is_global_discount_line = fields.Boolean(
        string='Is Global Discount',
        default=False
    )
    discount_type = fields.Selection([
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount')
    ], string='Discount Type')