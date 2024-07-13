<script>
	import Modal from "./EditModal.svelte";
	import { Table, Button, Col, Row } from "sveltestrap/src";
	let showModal = false;
	let currentId = 0;
	let currentName = "";
	let currentQuantity = 0;
	let currentPrice = 0;
	let itens = [];
	function removeItem(id) {
		itens = itens.filter((item) => item.id !== id);
	}
	function changeItem(id) {
        itens = itens.map((item) => {
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
	<!-- input binded with name -->
	<input type="text" bind:value={currentName} placeholder="Name" />
	<input type="number" bind:value={currentQuantity} placeholder="Quantity" />
	<input type="number" bind:value={currentPrice} placeholder="Price" />
	<Button
		color="primary"
		on:click={() => {
			// generate random id
			let id = Math.floor(Math.random() * 1000);
			itens = [
				...itens,
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
		}}>Add</Button
	>
	<Table>
		<thead>
			<td>Name</td>
			<td>Quantity</td>
			<td>Price</td>
		</thead>
		<tbody>
			{#each itens as item}
				<tr>
					<td>{item.name}</td>
					<td>{item.quantity}</td>
					<td>{item.price}</td>

					<td
						><Button color="danger" on:click={removeItem(item.id)}
							>Remove</Button
						>
						<Button
							on:click={() => {
								currentId = item.id;
								currentName = item.name;
								currentQuantity = item.quantity;
								currentPrice = item.price;
								showModal = true;
							}}>Edit</Button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</Table>
	<p>{currentName}</p>
	<Modal bind:showModal>
		<h2 slot="header">Edit Item</h2>
		<Table>
			<tbody>
				<tr>
					<td>Name</td>
					<td><input type="text" bind:value={currentName} /></td>
				</tr>
				<tr>
					<td>Quantity</td>
					<td><input type="number" bind:value={currentQuantity} /></td>
				</tr>
				<tr>
					<td>Price</td>
					<td><input type="number" bind:value={currentPrice} /></td>
				</tr>
			</tbody>
		</Table>
		<Button
			color="primary"
			on:click={() => {
				changeItem(currentId);
				showModal = false;
			}}>Save</Button
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
</style>
