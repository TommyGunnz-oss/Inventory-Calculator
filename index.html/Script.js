document.getElementById('lotForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const numberOfLots = parseInt(document.getElementById('numberOfLots').value);
    const lotInputsContainer = document.getElementById('lotInputs');
    lotInputsContainer.innerHTML = '';

    for (let i = 0; i < numberOfLots; i++) {
        const lotInput = document.createElement('div');
        lotInput.classList.add('lot-input');

        lotInput.innerHTML = `
            <label for="lot${i}">Lot Code ${i + 1}:</label>
            <input type="text" id="lotCode${i}" name="lotCode${i}" required>
            <label for="onHand${i}">On Hand Quantity:</label>
            <input type="number" id="onHand${i}" name="onHand${i}" required>
            <label for="system${i}">System Quantity:</label>
            <input type="number" id="system${i}" name="system${i}" required>
        `;

        lotInputsContainer.appendChild(lotInput);
    }

    document.getElementById('lotData').classList.remove('hidden');
});

document.getElementById('calculateButton').addEventListener('click', function() {
    const numberOfLots = parseInt(document.getElementById('numberOfLots').value);

    let totalOnHand = 0;
    let totalSystem = 0;
    let lotData = [];

    for (let i = 0; i < numberOfLots; i++) {
        const lotCode = document.getElementById(`lotCode${i}`).value;
        const onHand = parseInt(document.getElementById(`onHand${i}`).value);
        const system = parseInt(document.getElementById(`system${i}`).value);

        totalOnHand += onHand;
        totalSystem += system;

        lotData.push({ lotCode, onHand, system });
    }

    const totalAdjustment = totalOnHand - totalSystem;

    // Step 1: Make one large cycle count adjustment to match total quantities
    let largestOnHandLot = lotData.reduce((prev, current) => (prev.onHand > current.onHand) ? prev : current);
    largestOnHandLot.system += totalAdjustment;

    // Step 2: Adjust individual lot quantities to balance
    let remainingAdjustment = totalAdjustment;
    let lotChanges = [];

    for (let i = 0; i < lotData.length; i++) {
        let adjustment = lotData[i].onHand - lotData[i].system;
        
        if (adjustment !== 0) {
            lotData[i].system += adjustment;
            lotChanges.push({ lotCode: lotData[i].lotCode, adjustment });
        }

        remainingAdjustment -= adjustment;
        if (remainingAdjustment === 0) break;
    }

    // Display results
    document.getElementById('totalAdjustment').textContent = `Cycle ${totalAdjustment > 0 ? 'in' : 'out'} ${Math.abs(totalAdjustment)} cases to ${largestOnHandLot.lotCode}.`;
    
    const adjustedLotsBody = document.getElementById('adjustedLotsBody');
    adjustedLotsBody.innerHTML = '';
    lotChanges.forEach(change => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${change.lotCode}</td><td>${change.adjustment > 0 ? '+' : ''}${change.adjustment}</td>`;
        adjustedLotsBody.appendChild(row);
    });

    document.getElementById('lotChangesSection').classList.remove('hidden');
    document.getElementById('results').classList.remove('hidden');
});
