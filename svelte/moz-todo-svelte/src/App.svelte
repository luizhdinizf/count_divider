<script>
	import { Modal, Table, Button, Input } from "sveltestrap/src";
	import { writable } from "svelte/store";

	// Initialize the store with the value from localStorage
	const initialItens = JSON.parse(localStorage.getItem("itens")) || [];

	// Create the store
	const itens = writable(initialItens);

	// Subscribe to the store and update localStorage every time it changes
	itens.subscribe((value) => {
		localStorage.setItem("itens", JSON.stringify(value));
	});

	import FaTrash from "svelte-icons/fa/FaTrash.svelte";
	import FaDivide from "svelte-icons/fa/FaDivide.svelte";
	import FaCheck from "svelte-icons/fa/FaCheck.svelte";
	let openEdit = false;
	let openSplit = false;
	const toggleEdit = () => (openEdit = !openEdit);
	const toogleSplit = () => (openSplit = !openSplit);

	let currentId = 0;
	let currentName = "";
	let currentQuantity = 1;
	let currentPrice = 0;
	let currentFractionNumber = 2;
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

		return resultado;
	}
	// $: fractions = calculate_fractions(currentFractionNumber, currentQuantity);
	$: fractions = dividirEmPartes(currentQuantity, currentFractionNumber);

	function clearCurrent() {
		currentName = "";
		currentQuantity = 1;
		currentPrice = 1;
	}
	function divideItem(id, fractions = [4, 5]) {
		for (let i = 0; i < fractions.length; i++) {
			let newid = Math.floor(Math.random() * 1000);
			let parentItem = $itens.find((item) => item.id === id);
			let item = { ...parentItem };
			item.id = newid;
			item.name = parentItem.name + "_" + i;
			item.quantity = fractions[i];
			$itens = [...$itens, item];
		}
		$itens = $itens.filter((item) => item.id !== id);
	}
	function addItem() {
		if (currentName === "" || currentQuantity === 0 || currentPrice === 0) {
			return;
		}
		let id = Math.floor(Math.random() * 1000);
		$itens = [
			...$itens,
			{
				id: id,
				name: currentName,
				quantity: currentQuantity,
				price: currentPrice,
			},
		];
		currentName = "";
		currentQuantity = 0;
		currentPrice = 0;
	}
	function removeItem(id) {
		if (confirm("Are you sure you want to delete this item?")) {
			$itens = $itens.filter((item) => item.id !== id);
		}
	}
	function changeItem(id) {
		$itens = $itens.map((item) => {
			if (item.id === id) {
				item.name = currentName;
				item.quantity = currentQuantity;
				item.price = currentPrice;
			}
			return item;
		});
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
	/>
</svelte:head>
<main>
	<!-- Input binded with name -->
	<Table striped="true">
		<thead>
			<td
				>Name <Input
					type="text"
					bind:value={currentName}
					placeholder="Name"
				/></td
			>
			<td
				>Quantity <Input
					type="number"
					bind:value={currentQuantity}
					placeholder="Quantity"
				/></td
			>
			<td
				>Price <Input
					type="number"
					bind:value={currentPrice}
					placeholder="Price"
				/>
			</td>
			<td><Button color="primary" on:click={addItem}>+</Button></td>
		</thead>
		<tbody>
			{#each $itens as item}
				<tr>
					<td
						on:click={() => {
							currentId = item.id;
							currentName = item.name;
							currentQuantity = item.quantity;
							currentPrice = item.price;
							toggleEdit();
						}}>{item.name}</td
					>
					<td
						on:click={() => {
							currentId = item.id;
							currentName = item.name;
							currentQuantity = item.quantity;
							currentPrice = item.price;
							toggleEdit();
						}}>{item.quantity}</td
					>
					<td
						on:click={() => {
							currentId = item.id;
							currentName = item.name;
							currentQuantity = item.quantity;
							currentPrice = item.price;
							toggleEdit();
						}}>{item.price}</td
					>
					<td>
						<button
							style="color: red;"
							class="icon"
							on:click={removeItem(item.id)}><FaTrash /></button
						>
						<button
							style="color: blue;"
							class="icon"
							on:click={() => {
								currentId = item.id;
								currentName = item.name;
								currentQuantity = item.quantity;
								currentPrice = item.price;
								toogleSplit();
							}}><FaDivide /></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</Table>
	<Button on:click={() => ($itens = [])}>Limpar Conta</Button>
	<Modal
		body
		header={currentName}
		isOpen={openEdit}
		toggle={toggleEdit}
		on:close={clearCurrent}
	>
		<Table>
			<tbody>
				<tr>
					<td>Name</td>
					<td><Input type="text" bind:value={currentName} /></td>
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
		<button
			class="icon"
			style="color: green;"
			on:click={() => {
				changeItem(currentId);
			}}><FaCheck color="green" /></button
		>
	</Modal>
	<Modal
		body
		header={currentName}
		isOpen={openSplit}
		toggle={toogleSplit}
		on:close={clearCurrent}
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
						<td>Fraction</td>
						<td
							><Input
								type="number"
								bind:value={fraction}
								min="1"
								max={currentQuantity}
							/></td
						>
						incluir maximo e minimo no input
					</tr>
				{/each}
			</tbody>
		</Table>
		<button
			class="icon"
			style="color: green;"
			on:click={() => {
				{
					divideItem(currentId, fractions);
				}
			}}><FaCheck class="icon" /></button
		>
	</Modal>
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
</style>
