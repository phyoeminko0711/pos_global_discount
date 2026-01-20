{
    'name': 'POS Global Discount',
    'version': '19.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Apply global discount (percentage or fixed amount) in POS with maximum limit',
    'description': """
                   POS Global Discount for Odoo 19

                   Features:
                   - Apply global discount in POS
                   - Discount by percentage or fixed amount
                   - Uses a discount product
                   - Supports maximum discount limit
                   - Fully integrated with Odoo 19 POS
                       """,
    'author': 'Phyoe Min Ko',
    'support': 'phyoeko230@gmail.com',
    'license': 'LGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_config_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_global_discount/static/src/app/global_discount_button.js',
            'pos_global_discount/static/src/app/global_discount_button.xml',
        ],
    },
    "images": ["static/description/icon.png"],
    'installable': True,
    'application': False,
}
