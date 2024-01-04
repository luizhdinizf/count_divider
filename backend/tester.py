from bill import *
import json
clients = ["Pablo", "Ricardo", "Juan", "David"]
total = 34.50
bill = [{"item": "cerveja", "quantity": 15, "price": 0.8},
        {"item": "suco", "quantity": 3, "price": 1.5},
        {"item": "pizza", "quantity": 4, "price": 0.75},
        {"item": "agua", "quantity": 10, "price": 1.5}
        ]
rules = [{"name": "Pablo", "item": "cerveja", "mode": "arrived_after", "quantity": 4},
         {"name": "Pablo", "item": "cerveja", "mode": "leaved_on", "quantity": 9},
         {"name": "Juan", "item": "cerveja", "mode": "consumed", "quantity": 3},
         {"name": "David", "item": "suco", "mode": "consumed", "quantity": 3},
         {"name": "David", "item": "pizza", "mode": "consumed", "quantity": 3},
         ]
itens = itens_db(bill)
rules_db = rules_list_class(rules)
rules_db.evaluate_rules(itens)
bill_obj = bill_class(bill, total, clients, itens, rules_db)
bill_obj.calculate_division()
structure = bill_obj.generate_bill_structure()
bill_obj.print_bill()


encoded = MyEncoder().encode(structure)
json.dump(encoded, open("bill.json", "w"), indent=4)
