<script>
	import {
		Card,
		CardBody,
		CardHeader,
		CardFooter,
		Modal,
		Table,
		Button,
		Input,
	} from "sveltestrap/src";
	import { writable } from "svelte/store";

	// Initialize the store with the value from localStorage
	const initialItens = JSON.parse(localStorage.getItem("itens")) || [];
	const initialCustomers = JSON.parse(localStorage.getItem("customers")) || [];

	// Create the store
	const itens = writable(initialItens);
	const customers = writable(initialCustomers);

	// Subscribe to the store and update localStorage every time it changes
	itens.subscribe((value) => {
		localStorage.setItem("itens", JSON.stringify(value));
	});
	customers.subscribe((value) => {
		localStorage.setItem("customers", JSON.stringify(value));
	});

	import FaTrash from "svelte-icons/fa/FaTrash.svelte";
	import FaDivide from "svelte-icons/fa/FaDivide.svelte";
	import FaClone from "svelte-icons/fa/FaClone.svelte";
	let openEditItem = false;
	let openEditCustomer = false;
	let openSplit = false;
	let enableTip = true;
	const toggleEditItem = () => (openEditItem = !openEditItem);
	const toggleEditCustomer = () => (openEditCustomer = !openEditCustomer);
	const toogleSplit = () => (openSplit = !openSplit);

	let currentItemId = 0;
	let currentItemName = "";
	let currentCustomerName = "";	
	let currentCustomerId = 0;	
	let currentQuantity = 1;
	let currentPrice = 0;
	let currentFractionNumber = 1;
	let customersTotalSum = 0;
	
	function dividirEmPartes(numeroDeItens, quantidade) {
		if (numeroDeItens === 0 || quantidade === 0) {
			return;
		}
		const quociente = Math.floor(numeroDeItens / quantidade);
		const resto = numeroDeItens % quantidade;
		const resultado = [];

		for (let i = 0; i < quantidade - 1; i++) {
			resultado.push(quociente);
		}

		if (resto !== 0) {
			resultado.push(quociente + resto);
		} else {
			resultado.push(quociente);
		}
		adjustCustomerItens();
		return resultado;
	}
	$: fractions = dividirEmPartes(currentQuantity, currentFractionNumber);

	function calculate_bill_total(itens,enable) {
		if (enable) {
			billTotal = itens.reduce((acc, item) => acc + item.tipped_price * item.quantity, 0).toFixed(2);
		} else {
			billTotal = itens.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
		}
		return billTotal;
	}
	$: billTotal = calculate_bill_total($itens,enableTip);
	$: accountDiference = customersTotalSum - billTotal;

	
	function calculate_customer_totals() {
		let itens_subtotal = [];
		for (let i = 0; i < $itens.length; i++) {
			//counts how many customer checked this item
			let count = 0;
			
			for (let j = 0; j < $customers.length; j++) {
				for (let k = 0; k < $customers[j].itens.length; k++) {
					if ($customers[j].itens[k].name === $itens[i].name && $customers[j].itens[k].checked) {
						count++;
						break;
					}
				}
			}
			let current_item_price = enableTip ?  $itens[i].tipped_price : $itens[i].price;
			itens_subtotal.push({
				name: $itens[i].name,
				subtotal: (current_item_price*$itens[i].quantity) / count,
			});
		}
		
		// map customer and add subtotal to each customer
		for (let i = 0; i < $customers.length; i++) {
			let customer_total = 0;
			for (let j = 0; j < $customers[i].itens.length; j++) {
				if ($customers[i].itens[j].checked) {
					customer_total += itens_subtotal.find((item) => item.name === $customers[i].itens[j].name).subtotal;
				}
			}
			$customers[i].total = customer_total;
		}
		let total = 0;
		for (let i = 0; i < $customers.length; i++) {
			total += $customers[i].total;
		}
		customersTotalSum = total.toFixed(2);
		let diff = billTotal - customersTotalSum;
		let notSplittedItems = $itens.filter(item => !checkItemSplitted(item.name));
		if (diff !== 0) {
			let notSplittedItemsList = notSplittedItems.map(item => item.name).join('\n ');			
			alert("Faltam R$ " + diff.toFixed(2) + " para fechar a conta!!\nOs seguintes itens não foram divididos:\n" + notSplittedItemsList);
		}
		
	}

	function checkItemSplitted(item_name){
		for (let i = 0; i < $customers.length; i++) {
			for (let j = 0; j < $customers[i].itens.length; j++) {
				if ($customers[i].itens[j].name === item_name && $customers[i].itens[j].checked) {
					return true;
				}
			}
		}
		return false;
	}
	
	function clearAccount() {
		if (confirm("Você tem certeza que deseja limpar a conta?")) {
			$itens = [];
			//iterate over customers and set itens []
			$customers = [];
			customersTotalSum = 0;
		}
	}

	function divideItem(id, fractions = [4, 5]) {
		for (let i = 1; i < fractions.length + 1; i++) {
			let newid = Math.floor(Math.random() * 1000);
			let parentItem = $itens.find((item) => item.id === id);
			let item = { ...parentItem };
			item.id = newid;
			item.name = parentItem.name + " " + i;
			item.quantity = fractions[i-1];
			$itens = [...$itens, item];
		}
		$itens = $itens.filter((item) => item.id !== id);
		adjustCustomerItens()
	}
	function addItem() {
		if (currentItemName === "" || currentQuantity === 0 || currentPrice === 0) {
			return;
		}
		let id = Math.floor(Math.random() * 1000);
		let tipped_price = currentPrice * 1.1;
		$itens = [
			...$itens,
			{
				id: id,
				name: currentItemName,
				quantity: currentQuantity,
				price: currentPrice,
				tipped_price: tipped_price,
			},
		];
		currentItemName = '';
		currentQuantity = 1;
		currentPrice = 0;
		adjustCustomerItens()
	}
	function removeItem(id) {
		// if (confirm("Are you sure you want to delete this item?")) {
		$itens = $itens.filter((item) => item.id !== id);
		adjustCustomerItens()
		// }
	}
	function changeItem(id) {
		$itens = $itens.map((item) => {
			if (item.id === id) {
				item.name = currentItemName;
				item.quantity = currentQuantity;
				item.price = currentPrice;
				item.tipped_price = item.price * 1.1;
			}
			return item;
		});
		adjustCustomerItens()
		currentItemName = "";
	}
	function changeCustomer(id) {
		$customers = $customers.map((customer) => {
			if (customer.id === id) {
				customer.name = currentCustomerName;
			}
			return customer;
		});
		currentCustomerName = "";
	}
	function addCustomer() {
		if (currentCustomerName === "") {
			return;
		}
		let id = Math.floor(Math.random() * 1000);
		let currentItens = $itens.map(item => {
			return {
				...item,
				checked: true
			}
		})
		$customers = [
			...$customers,
			{
				id: id,
				name: currentCustomerName,
				itens:  currentItens,	
				total: 0,			
			},
		];
		currentCustomerName = "";	
	}
	function cloneCustomer(id) {
		let customer = $customers.find((customer) => customer.id === id);
		let new_id = Math.floor(Math.random() * 1000);
		$customers = [
			...$customers,
			{
				id: new_id,
				name: customer.name + " (cópia)",
				itens: customer.itens,
				total: 0,
			},
		];
	}
	function removeCustomer(id) {
		$customers = $customers.filter((customer) => customer.id !== id);
	}
	function adjustCustomerItens(){
		$customers = $customers.map(customer => {			
			// add the itens that are not in the customer itens list
			for (let i = 0; i < $itens.length; i++) {
				for (let j = 0; j < customer.itens.length; j++) {
					if ($itens[i].name === customer.itens[j].name) {
						break;
					}
					if (j === customer.itens.length - 1) {
						customer.itens.push({
							...$itens[i],
							checked: false
						})
					}					
				}
			}
			// remove the itens that are not in the itens list
			for (let i = 0; i < customer.itens.length; i++) {
				for (let j = 0; j < $itens.length; j++) {
					if (customer.itens[i].name === $itens[j].name) {
						break;
					}
					if (j === $itens.length - 1) {
						customer.itens.splice(i, 1)
					}
				}
			}			
			return customer
		})
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
	/>
</svelte:head>
<main>
	<h2>Itens Consumidos</h2>
	
	<Table striped="true">
		<thead>
			<td
				>Nome <Input
					type="text"
					bind:value={currentItemName}
					placeholder="Nome"
				/></td
			>
			<td
				>Quantidade <Input
					type="number"
					bind:value={currentQuantity}
					placeholder="Quantidade"
				/></td
			>
			<td
				>Preço <Input
					type="number"
					bind:value={currentPrice}
					placeholder="Preço"
				/>
			</td>
			<td><Button color="primary" on:click={addItem}>+</Button></td>
		</thead>
		<tbody>
			{#each $itens as item}
				<tr>
					<td						
						on:click={() => {
							currentItemId = item.id;
							currentItemName = item.name;
							currentQuantity = item.quantity;
							currentPrice = item.price;
							toggleEditItem();
						}}>{item.name}</td
					>
					<td
						on:click={() => {
							currentItemId = item.id;
							currentItemName = item.name;
							currentQuantity = item.quantity;
							currentPrice = item.price;
							toggleEditItem();
						}}>{item.quantity}</td
					>
					<td
						on:click={() => {
							currentItemId = item.id;
							currentItemName = item.name;
							currentQuantity = item.quantity;
							currentPrice = item.price;
							toggleEditItem();
						}}
						>{new Intl.NumberFormat("pt-BR", {
							style: "currency",
							currency: "BRL",
						}).format(enableTip ? item.tipped_price : item.price)}</td
					>
					<td>
						<button
							style="color: red;"
							class="icon"
							on:click={removeItem(item.id)}><FaTrash /></button
						>
					</td>
					<td>
						<button
							style="color: blue;"
							class="icon"
							on:click={() => {
								currentItemId = item.id;
								currentItemName = item.name;
								currentQuantity = item.quantity;
								currentPrice = item.price;
								toogleSplit();
							}}><FaDivide /></button
						>
					</td>
				</tr>
			{/each}
			<tr>
			<td><strong>Total</strong></td>
			<td></td>
			<td><strong>{new Intl.NumberFormat("pt-BR", {style: "currency",currency: "BRL",}).format(billTotal)}<strong></td>
			<td></td>
			</tr>
		</tbody>
	</Table>
	
	<Modal
		body
		header={currentItemName}
		isOpen={openEditItem}
		toggle={toggleEditItem}
		on:close={() => {
			changeItem(currentItemId);
		}}
	>
		<Table>
			<tbody>
				<tr>
					<td>Name</td>
					<td><Input type="text" bind:value={currentItemName} /></td>
				</tr>

				<tr>
					<td>Quantity</td>
					<td><Input type="number" bind:value={currentQuantity} /></td
					>
				</tr>
				<tr>
					<td>Price</td>
					<td><Input type="number" bind:value={currentPrice} /></td>
				</tr>
			</tbody>
		</Table>
	</Modal>
	<!-- Modal de edição depessoa -->
	<Modal
		body
		header={currentCustomerName}
		isOpen={openEditCustomer}
		toggle={toggleEditCustomer}
		on:close={() => {
			changeCustomer(currentCustomerId);
		}}
	>
		<Input type="text" bind:value={currentCustomerName} />
	</Modal>
	<Modal
		body
		header={currentItemName}
		isOpen={openSplit}
		toggle={toogleSplit}
		on:close={() => {
			// {
			// 	divideItem(currentItemId, fractions);
			// }
		}}
	>
		<Table>
			<tbody>
				<tr> </tr><tr>
					<td>Quantity</td>
					<td><Input type="number" bind:value={currentQuantity} /></td
					>
				</tr>
				<tr>
					<td>Número de divisões</td>
					<td
						><Input
							type="number"
							bind:value={currentFractionNumber}
						/></td
					>
				</tr>

				{#each fractions as fraction}
					<tr>
						<td>Nova Quantidade</td>
						<td
							><Input
								type="number"
								bind:value={fraction}
								min="1"
								max={currentQuantity}
							/></td
						>
						<!-- incluir maximo e minimo no input -->
					</tr>
				{/each}
				
			</tbody>
		</Table>
		<Button on:click={() => divideItem(currentItemId, fractions)}
			>Dividir</Button
		>
	</Modal>
	<h2>Pessoas na Mesa</h2>
	<Table>
		<thead>
			<td><Input type="text" bind:value={currentCustomerName} placeholder="Name" /></td>
			<td><Button color="primary" on:click={() => addCustomer()}>+</Button></td>
		</thead>
	</Table>
	<div class="peopleCardList">
		{#each $customers as {name,id,itens: customer_itens,total}}
			<Card>
				<CardHeader>
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<div style="text-align: center; flex-grow: 1; font-weight: bold;" on:click={() => {
							currentCustomerId = id;  
							currentCustomerName = name;              
							toggleEditCustomer();
						}}>{name}</div>
						<div style="display: flex; justify-content: flex-end;">
							<button
								style="color: blue;"
								class="icon"
								on:click={cloneCustomer(id)}><FaClone /></button>
							<button
								style="color: red;"
								class="icon"
								on:click={removeCustomer(id)}><FaTrash /></button>
						</div>
					</div>
				</CardHeader>
				<CardBody>
						{#each customer_itens as this_item}
								<div style="display: flex; align-items: center;">
									<Input type="switch" bind:checked={this_item.checked}/>
									<span on:click={() => this_item.checked = !this_item.checked} style="color:{checkItemSplitted(this_item.name) ? 'green' : 'red'}">{this_item.name}</span>
								</div>					
						{/each}
				</CardBody>
				<CardFooter>
					<strong style="color: {accountDiference == 0 ? 'green' : 'red'}">		
					Total: {new Intl.NumberFormat("pt-BR", {
						style: "currency",
						currency: "BRL",
					}).format(total)}
					</strong>
				</CardFooter>
			</Card>
		{/each}
	</div>
	<br>
	<table>
		<tr>
			<td><Button color="danger" on:click={clearAccount}>Limpar Conta</Button></td>
			<td><Button color="success" on:click={calculate_customer_totals}>Dividir Conta</Button></td>
			<td><Input type="switch" bind:checked={enableTip} label="10% de Gorjeta"/></td>
		</tr>
		<tr>
			<td><strong>Total a ser pago:</strong></td>
			<td>R${billTotal}</td>
		</tr>
		<tr>
			<td style="color: {accountDiference == 0 ? 'green' : 'red'}"><strong>Total Calculado:</strong></td>
			<td style="color: {accountDiference == 0 ? 'green' : 'red'}">R${customersTotalSum}</td>
		</tr>
		<tr>
			<td style="color: {accountDiference == 0 ? 'green' : 'red'}"><strong>Diferença:</strong></td>
			<td style="color: {accountDiference == 0 ? 'green' : 'red'}">R${(customersTotalSum - billTotal).toFixed(2)}</td>
		</tr>
	</table>	
	
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	.icon {
		background: none;
		border: none;
		width: 32px;
		height: 32px;
	}
	.icon:hover {
		filter: saturate(20%);
		filter: drop-shadow(0 0 0.5rem blue);
	}
	.icon:active {
		background: none;
		filter: drop-shadow(0 0 0.5rem green);
	}
	.peopleCardList {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}
	

		
</style>
