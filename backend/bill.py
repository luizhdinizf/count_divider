
from json import JSONEncoder

class MyEncoder(JSONEncoder):
        def default(self, o):
            return o.__dict__

modes = ["consumed", "arrived_after", "leaved_on", "consumed_solo"]
class bill_class():
    def __init__(self, original_bill, informed_total, clients, itens_db, rules_db) -> None:
        """
        Initializes a bill object.

        Parameters:
        - original_bill (dict): The original bill.
        - informed_total (float): The total amount informed by the user.
        - clients (list): List of clients.
        - itens_db (itens_db): Database of items.
        - rules_db (rules_list_class): Database of rules.
        """
        self.rules_db = rules_db
        self.original_bill = original_bill
        self.informed_total = informed_total
        self.clients = clients
        self.divided_bill = {client: 0 for client in clients}
        self.itens_db = itens_db.dict

    def add_amount(self, client, amount):
        """
        Adds an amount to a client's divided bill.

        Parameters:
        - client (str): The client's name.
        - amount (float): The amount to be added.
        """
        self.divided_bill[client] += amount

    def calculate_division(self):
        """
        Calculates the division of the bill among the clients.
        """
        for client in self.divided_bill:
            for item in self.itens_db:
                self.add_amount(
                    client, self.itens_db[item].get_consumer_sum(client))

    def get_divided_total(self):
        """
        Returns the total amount of the divided bill.
        """
        return sum(self.divided_bill.values())

    @property
    def real_total(self):
        """
        Property that returns the real total amount of the bill.
        """
        return sum([self.itens_db[item].get_real_total() for item in self.itens_db])

    def check_divided_total_match(self):
        """
        Checks if the divided total matches the real total.
        Returns True if they match, False otherwise.
        """
        if self.get_divided_total() == self.real_total:
            return True
        else:
            return False

    def check_informed_total_match(self):
        """
        Checks if the informed total matches the real total.
        Returns True if they match, False otherwise.
        """
        if self.real_total == self.informed_total:
            return True
        else:
            return False

    def check_match(self):
        """
        Checks if the informed total and the divided total match the real total.
        Prints the result and any discrepancies found.
        """
        if self.check_informed_total_match():
            print("Total informado está correto")
        else:
            print("Total informado está incorreto")
            diferenca = self.real_total-self.informed_total
            if diferenca < 0:
                print(
                    f"Total informado está R$ {abs(diferenca):.2f} maior que o calculado")
            else:
                print(
                    f"Total informado está R$ {abs(diferenca):.2f} menor que o calculado")
            return False
        if self.check_divided_total_match():
            print("Total está correto")
        else:
            print("Total está incorreto")
            for item in self.itens_db:
                if self.itens_db[item].check_total_match():
                    pass
                else:
                    diferenca = self.itens_db[item].get_real_total(
                    )-self.itens_db[item].get_divided_total()
                    if diferenca > 0:
                        print(
                            f"{item} está incorreto, faltam R$ {abs(diferenca):.2f} para fechar")
                    else:
                        print(
                            f"{item} está incorreto, sobram R$ {abs(diferenca):.2f} para fechar")

    def print_divided_bill(self):
        """
        Prints the divided bill for each client.
        """
        for client in self.divided_bill:
            valor_cliente = self.divided_bill[client]
            print(f"{client} deve pagar {valor_cliente:.2f}")

    def generate_itens_differece(self):
        """
        Generates a dictionary with the difference between the real total and the divided total for each item.
        Returns the dictionary.
        """
        itens_differece = {}
        for item in self.itens_db:
            itens_differece[item] = self.itens_db[item].get_real_total(
            )-self.itens_db[item].get_divided_total()
        return itens_differece

    def generate_message(self):
        """
        Generates a message to be displayed to the user.
        Returns the message.
        """
        message = ""

        if self.check_divided_total_match():
            message += "Total está correto\n"
        else:
            message += "Total está incorreto: "
            if self.real_total-self.get_divided_total() > 0:
                message += f"Faltam {abs(self.real_total-self.get_divided_total()):.2f} para fechar\n"
            else:
                message += f"Sobram {abs(self.real_total-self.get_divided_total()):.2f} para fechar\n"
            itens_differece = self.generate_itens_differece()
            for item in itens_differece:
                if itens_differece[item] > 0:
                    message += f"{item} está incorreto, faltam {abs(itens_differece[item]):.2f} para fechar\n"
        return message

    def generate_bill_structure(self):
        """
        Generates a dictionary with the structure of the bill.
        Returns the dictionary.
        """
        bill_structure = {
            "real_total": self.real_total,
            "informed_total": self.informed_total,
            "divided_total": self.get_divided_total(),
            "itens": self.itens_db,
            "divided_bill": self.divided_bill,
            "original_bill": self.original_bill,
            "rules": self.rules_db,
            "clients": self.clients,
            "informed_total_match": self.check_informed_total_match(),
            "divided_total_match": self.check_divided_total_match(),
            "real_to_informed": self.real_total-self.informed_total,
            "real_to_divided": self.real_total-self.get_divided_total(),
            "itens_differece": self.generate_itens_differece(),
            "message": self.generate_message()
        }
        return bill_structure

    def print_bill(self):
        """
        Prints the original bill, the divided bill, and the total amounts.
        """
        print("Conta original:")
        print(self.original_bill)
        print("Conta dividida:")
        self.print_divided_bill()
        print("Total informado:", self.informed_total)
        print("Total calculado:", self.get_divided_total())
        print("Total real:", self.real_total)
        self.check_match()

    def __repr__(self) -> str:
        """
        Returns a string representation of the bill object.
        """
        return f"bill:{self.divided_bill}\n"


class rule_class:
    def __init__(self, name, item, mode, number) -> None:
        """
        Initializes a rule object.

        Parameters:
        - name (str): The name of the rule.
        - item (str): The item to which the rule applies.
        - mode (str): The mode of the rule.
        - number (int): The number associated with the rule.
        """
        self.name = name
        self.item = item
        self.mode = mode
        self.number = number
        self.evaluated = False

    def __repr__(self) -> str:
        """
        Returns a string representation of the rule object.
        """
        return f"name:{self.name}, item:{self.item}, mode:{self.mode}, number:{self.number}\n"


class rules_list_class:
    def __init__(self, informed_rules) -> None:
        """
        Initializes a list of rules.

        Parameters:
        - informed_rules (list): List of dictionaries containing the rules information.
        """
        self.rules = []
        self.modes_priority = modes
        for rule in informed_rules:
            self.include_rule(rule["name"], rule["item"],
                              rule["mode"], rule["quantity"])

    def include_rule(self, name, item, mode, number):
        """
        Includes a rule in the list.

        Parameters:
        - name (str): The name of the rule.
        - item (str): The item to which the rule applies.
        - mode (str): The mode of the rule.
        - number (int): The number associated with the rule.

        Returns:
        - rules (list): The updated list of rules.
        """
        self.rules.append(rule_class(name, item, mode, number))
        return self.rules

    def sort_by_priority(self):
        """
        Sorts the rules list by priority.

        Returns:
        - rules (list): The sorted list of rules.
        """
        self.rules.sort(key=lambda x: self.modes_priority.index(x["mode"]))
        return self.rules

    def evaluate_rules(self, itens):
        """
        Evaluates the rules and applies them to the items.

        Parameters:
        - itens (itens_db): The database of items.

        Returns:
        - itens (itens_db): The updated database of items.
        """
        for rule in self.rules:
            if rule.evaluated == False:
                rule.evaluated = True
                itens.dict[rule.item].evaluate_rule(
                    rule.name, rule.mode, rule.number)
        return itens

    def __repr__(self) -> str:
        """
        Returns a string representation of the rules list object.
        """
        return f"rules:{self.rules}\n"


class item_class:
    def __init__(self, price, name) -> None:
        """
        Initializes an item object.

        Parameters:
        - price (float): The price of the item.
        - name (str): The name of the item.
        """
        self.consumers = []
        self.price = price
        self.individual_fraction = 0
        self.name = name
        self.type = "divided"

    def include_consumer(self, consumer):
        """
        Includes a consumer for the item.

        Parameters:
        - consumer (str): The name of the consumer.
        """
        if self.type == "divided":
            if consumer not in self.consumers:
                self.consumers.append(consumer)
                self.individual_fraction = self.price/len(self.consumers)
        elif self.type == "solo":
            if len(self.consumers) == 0:
                self.consumers.append(consumer)
                self.individual_fraction = self.price
            else:
                print("item already consumed")

    def remove_consumer(self, consumer):
        """
        Removes a consumer from the item.

        Parameters:
        - consumer (str): The name of the consumer.
        """
        if consumer in self.consumers:
            self.consumers.remove(consumer)
            try:
                self.individual_fraction = self.price/len(self.consumers)
            except ZeroDivisionError:
                self.individual_fraction = 0

    def check_consumer(self, consumer):
        """
        Checks if a consumer is included in the item.

        Parameters:
        - consumer (str): The name of the consumer.

        Returns:
        - included (bool): True if the consumer is included, False otherwise.
        """
        if consumer in self.consumers:
            return True
        else:
            return False

    def make_solo(self, consumer):
        """
        Makes the item a solo item for a specific consumer.

        Parameters:
        - consumer (str): The name of the consumer.
        """
        self.type = "solo"
        self.include_consumer(consumer)

    def __repr__(self) -> str:
        """
        Returns a string representation of the item object.
        """
        return f"name:{self.name}, price:{self.price}, consumers:{self.consumers}, individual_fraction:{self.individual_fraction}\n"


class item_list_class:
    def __init__(self, name, price, number=0) -> None:
        """
        Initializes a list of items.

        Parameters:
        - name (str): The name of the item.
        - price (float): The price of the item.
        - number (int): The number of items in the list.
        """
        self.name = name
        self.price = price
        self.itens = [item_class(price, name) for i in range(number)]

    def include_item(self, item):
        """
        Includes an item in the list.

        Parameters:
        - item (item_class): The item to be included.
        """
        self.itens.append(item)

    def evaluate_rule(self, consumer, mode, number):
        """
        Evaluates a rule and applies it to the items.

        Parameters:
        - consumer (str): The name of the consumer.
        - mode (str): The mode of the rule.
        - number (int): The number associated with the rule.
        """
        if mode == "arrived_after":
            self.arrived_after(consumer, number)
        elif mode == "leaved_on":
            self.leaved_on(consumer, number)
        elif mode == "consumed":
            self.consumed(consumer)
        elif mode == "consumed_solo":
            self.consumed_solo(consumer, number)
        else:
            print("mode not defined")

    def arrived_after(self, consumer, number):
        """
        Applies the "arrived_after" rule to the items.

        Parameters:
        - consumer (str): The name of the consumer.
        - number (int): The number associated with the rule.
        """
        self.consumed(consumer)
        for item in self.itens[:number]:
            item.remove_consumer(consumer)

    def leaved_on(self, consumer, number):
        """
        Applies the "leaved_on" rule to the items.

        Parameters:
        - consumer (str): The name of the consumer.
        - number (int): The number associated with the rule.
        """
        self.consumed(consumer)
        for item in self.itens[number:]:
            item.remove_consumer(consumer)

    def consumed(self, consumer):
        """
        Applies the "consumed" rule to the items.

        Parameters:
        - consumer (str): The name of the consumer.
        """
        if any([item.check_consumer(consumer) for item in self.itens]):
            return None
        for item in self.itens:
            item.include_consumer(consumer)

    def consumed_solo(self, consumer, number):
        """
        Applies the "consumed_solo" rule to the items.

        Parameters:
        - consumer (str): The name of the consumer.
        - number (int): The number associated with the rule.
        """
        for i in range(number):
            for item in self.itens[::-1]:
                if len(item.consumers) == 0:
                    item.make_solo(consumer)
                    break
            ordered = self.itens.copy()
            ordered.sort(key=lambda x: len(x.consumers))
            ordered[-1].make_solo(consumer)

    def get_real_total(self):
        """
        Returns the real total amount of the items.
        """
        return sum([item.price for item in self.itens])

    def get_divided_total(self):
        """
        Returns the divided total amount of the items.
        """
        return sum([item.individual_fraction*len(item.consumers) for item in self.itens])

    def check_total_match(self):
        """
        Checks if the real total matches the divided total.
        Returns True if they match, False otherwise.
        """
        if self.get_real_total() == self.get_divided_total():
            return True
        else:
            return False

    def __repr__(self) -> str:
        """
        Returns a string representation of the item list object.
        """
        return f"itens:{self.itens}\n"

    def get_consumer_sum(self, consumer):
        """
        Returns the sum of the individual fractions for a specific consumer.

        Parameters:
        - consumer (str): The name of the consumer.

        Returns:
        - sum (float): The sum of the individual fractions.
        """
        return sum([item.individual_fraction for item in self.itens if consumer in item.consumers])


class itens_db:
    def __init__(self, bill, gorjeta=1.1) -> None:
        """
        Initializes a database of items.

        Parameters:
        - bill (list): List of dictionaries containing the items information.
        """
        self.dict = {item["item"]: item_list_class(
            item["item"], item["price"]*gorjeta, item["quantity"]) for item in bill}

def calculate_bill(bill, total_informado, clients, rules, gorjeta=1.1):
    itens = itens_db(bill,gorjeta)
    rules_db = rules_list_class(rules)
    rules_db.evaluate_rules(itens)
    bill_obj = bill_class(bill, total_informado, clients, itens, rules_db)
    bill_obj.calculate_division()
    return bill_obj.generate_bill_structure()

def lambda_handler(received, context):
    received = json.loads(event['body'])
    bill = received['bill']
    try:
        total_informado = received['total_informado']
    except:
        total_informado = 0
    clients = received['clients']
    rules = received['rules']
    gorjeta = float(received['gorjeta']['tip'])
    itens = itens_db(bill,gorjeta)
    rules_db = rules_list_class(rules)
    rules_db.evaluate_rules(itens)
    bill_obj = bill_class(bill, total_informado, clients, itens, rules_db)
    bill_obj.calculate_division()
    structure = bill_obj.generate_bill_structure()
    encoded = MyEncoder().encode(structure)
    return encoded
    #raise Exception('Something went wrong')
