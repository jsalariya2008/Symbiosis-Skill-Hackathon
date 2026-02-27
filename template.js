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

    python_rsa_to_kyber: {
        id: 'python_rsa_to_kyber',
        name: 'RSA → Kyber (Python)',
        language: 'python',
        category: 'python',
        description: 'Migrate Python RSA code to Kyber-768',
        tags: ['RSA', 'Kyber', 'Python'],
        before: `from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

class CryptoHandler:
    def generate_keys(self):
        # Vulnerable: RSA key generation
        key = RSA.generate(2048)
        return key.publickey(), key
    
    def encrypt(self, data, public_key):
        cipher = PKCS1_OAEP.new(public_key)
        return cipher.encrypt(data)`,
        after: `from pqcrypto.kem.kyber768 import generate_keypair, encrypt, decrypt
from Crypto.Cipher import AES
import hashlib

class CryptoHandler:
    def generate_keys(self):
        # Quantum-safe: Kyber-768 key generation
        public_key, secret_key = generate_keypair()
        return public_key, secret_key
    
    def encrypt(self, data, public_key):
        # Encapsulate a shared secret using Kyber
        ciphertext, shared_secret = encrypt(public_key)
        
        # Derive AES key from shared secret
        aes_key = hashlib.sha256(shared_secret).digest()
        
        # Encrypt data with AES
        cipher = AES.new(aes_key, AES.MODE_GCM)
        encrypted_data, tag = cipher.encrypt_and_digest(data)
        
        return {
            'kyber_ciphertext': ciphertext,
            'nonce': cipher.nonce,
            'tag': tag,
            'encrypted_data': encrypted_data
        }`,
        changes: [
            'Replaced RSA with Kyber-768',
            'Added KEM-based key encapsulation',
            'Integrated AES-GCM for data encryption'
        ],
