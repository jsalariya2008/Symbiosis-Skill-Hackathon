function scanPhishing() {
    const text = document.getElementById("phishText").value.toLowerCase();
    const url = document.getElementById("phishUrl").value.toLowerCase();
    const resultBox = document.getElementById("phishResult");
    const loading = document.getElementById("scanLoading");

    if (!text && !url) {
        resultBox.innerHTML = "⚠️ Enter message or URL";
        return;
    }

    loading.style.display = "block";
    resultBox.innerHTML = "";

    setTimeout(() => {

        let score = 0;
        let findings = [];

        const phishingKeywords = [
            "quantum upgrade",
            "quantum safe",
            "upgrade encryption",
            "urgent action",
            "verify wallet",
            "crypto upgrade",
            "security update required"
        ];

        const brands = ["paypal", "metamask", "coinbase", "bank", "google"];
        const suspiciousTLDs = [".xyz", ".top", ".ru", ".tk", ".click"];

        phishingKeywords.forEach(word => {
            if (text.includes(word)) {
                score += 2;
                findings.push("Phishing phrase detected: " + word);
            }
        });

        brands.forEach(brand => {
            if (text.includes(brand)) {
                score += 1;
                findings.push("Brand impersonation: " + brand);
            }
        });

        if (url) {
            suspiciousTLDs.forEach(tld => {
                if (url.endsWith(tld)) {
                    score += 2;
                    findings.push("Suspicious domain extension");
                }
            });

            if (url.includes("-")) {
                score += 1;
                findings.push("Possible impersonation domain");
            }
        }

        let risk = "LOW";
        let riskClass = "low-risk";

        if (score >= 6) {
            risk = "HIGH";
            riskClass = "high-risk";
        } else if (score >= 3) {
            risk = "MEDIUM";
            riskClass = "medium-risk";
        }

        loading.style.display = "none";

        resultBox.innerHTML = `
            <h3 class="${riskClass}">Risk Level: ${risk}</h3>
            <strong>Threat Score:</strong> ${score}<br><br>
            ${findings.join("<br>")}
        `;

    }, 900);
}
