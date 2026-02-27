// ===== CODE TEMPLATES =====

const CODE_TEMPLATES = {
    java_rsa_to_kyber: {
        id: 'java_rsa_to_kyber',
        name: 'RSA → Kyber (Java)',
        language: 'java',
        category: 'java',
        description: 'Transform RSA key generation to Kyber-768',
        tags: ['RSA', 'Kyber', 'Key Exchange'],
        before: `import java.security.*;

public class CryptoExample {
    public KeyPair generateKeys() throws Exception {
        // Vulnerable: RSA key generation
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        return keyGen.generateKeyPair();
    }
}`,
        after: `import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;
import org.bouncycastle.pqc.jcajce.spec.KyberParameterSpec;
import java.security.*;

public class CryptoExample {
    static {
        Security.addProvider(new BouncyCastlePQCProvider());
    }
    
    public KeyPair generateKeys() throws Exception {
        // Quantum-safe: Kyber-768 key generation
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("Kyber", "BCPQC");
        keyGen.initialize(KyberParameterSpec.kyber768);
        return keyGen.generateKeyPair();
    }
}`,
        changes: [
            'Replaced RSA with Kyber-768 algorithm',
            'Added BouncyCastle PQC provider',
            'Updated key generation to use quantum-safe parameters'
        ],
        improvements: [
            'Resistant to quantum attacks',
            'NIST standardized algorithm',
            'Smaller key sizes than RSA'
        ],
        notes: 'Kyber uses a Key Encapsulation Mechanism (KEM) rather than direct encryption.',
        libraries: ['Bouncy Castle PQC']
    },
