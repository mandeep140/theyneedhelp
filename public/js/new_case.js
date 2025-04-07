const stateCityMap = {
    andhrapradesh: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    arunachalpradesh: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
    assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
    bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
    chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar"],
    himachalpradesh: ["Shimla", "Dharamshala", "Manali", "Solan", "Mandi"],
    jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
    karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    madhyapradesh: ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"],
    maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
    meghalaya: ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
    mizoram: ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
    nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
    punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
    sikkim: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Singtam"],
    tamilnadu: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    telangana: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
    tripura: ["Agartala", "Udaipur", "Kailashahar", "Dharmanagar", "Belonia"],
    uttarpradesh: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
    uttarakhand: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"],
    westbengal: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    andamanandnicobar: ["Port Blair", "Diglipur", "Rangat", "Mayabunder", "Car Nicobar"],
    chandigarh: ["Chandigarh"],
    dadraandnagarhavelianddamananddiu: ["Silvassa", "Daman", "Diu", "Amli", "Khadoli"],
    delhi: ["New Delhi", "Delhi", "Dwarka", "Rohini", "Saket"],
    lakshadweep: ["Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy"],
    puducherry: ["Puducherry", "Oulgaret", "Karaikal", "Yanam", "Mahe"],
    jammuandkashmir: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    ladakh: ["Leh", "Kargil", "Nubra", "Zanskar", "Padum"]
};

// Function to update cities based on selected state
function updateCities() {
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");
    const selectedState = stateSelect.value;

    // Clear previous city options
    citySelect.innerHTML = '<option value="">--Select City--</option>';

    if (selectedState && stateCityMap[selectedState]) {
        // Populate city dropdown with cities of the selected state
        stateCityMap[selectedState].forEach(city => {
            const option = document.createElement("option");
            option.value = city.toLowerCase().replace(/\s+/g, '');
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}