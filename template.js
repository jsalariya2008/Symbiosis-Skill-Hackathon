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
         improvements: [
            'Quantum-resistant security',
            'Authenticated encryption',
            'Faster key generation'
        ],
        notes: 'Install required library: pip install pqcrypto',
        libraries: ['pqcrypto', 'pycryptodome']
    },

    cpp_rsa_to_kyber: {
        id: 'cpp_rsa_to_kyber',
        name: 'RSA → Kyber (C++)',
        language: 'cpp',
        category: 'cpp',
        description: 'Convert OpenSSL RSA to liboqs Kyber',
        tags: ['RSA', 'Kyber', 'C++', 'OpenSSL'],
        before: `#include <openssl/rsa.h>
#include <openssl/pem.h>

class CryptoManager {
public:
    RSA* generateKeys() {
        // Vulnerable: RSA key generation
        RSA *rsa = RSA_new();
        BIGNUM *bne = BN_new();
        BN_set_word(bne, RSA_F4);
        RSA_generate_key_ex(rsa, 2048, bne, NULL);
        BN_free(bne);
        return rsa;
    }
};`,
        after: `#include <oqs/oqs.h>
#include <cstring>

class CryptoManager {
private:
    OQS_KEM *kem = nullptr;
    
public:
    CryptoManager() {
        // Initialize Kyber-768
        kem = OQS_KEM_new(OQS_KEM_alg_kyber_768);
    }
    
    ~CryptoManager() {
        if (kem) OQS_KEM_free(kem);
    }
    
    bool generateKeys(uint8_t **public_key, uint8_t **secret_key) {
        // Quantum-safe: Kyber-768 key generation
        *public_key = new uint8_t[kem->length_public_key];
        *secret_key = new uint8_t[kem->length_secret_key];
        
        return OQS_KEM_keypair(kem, *public_key, *secret_key) == OQS_SUCCESS;
    }
};`,
         changes: [
            'Replaced OpenSSL RSA with liboqs Kyber',
            'Changed from RSA to KEM approach',
            'Added proper memory management'
        ],
        improvements: [
            'Quantum-resistant cryptography',
            'Efficient implementation',
            'Well-tested library (liboqs)'
        ],
        notes: 'Requires liboqs library. Install: https://github.com/open-quantum-safe/liboqs',
        libraries: ['liboqs']
    },

    java_ecdsa_to_dilithium: {
        id: 'java_ecdsa_to_dilithium',
        name: 'ECDSA → Dilithium (Java)',
        language: 'java',
        category: 'java',
        description: 'Convert ECDSA signatures to Dilithium',
        tags: ['ECDSA', 'Dilithium', 'Signatures'],
        before: `import java.security.*;

public class SignatureExample {
    public byte[] signData(byte[] data, PrivateKey privateKey) 
            throws Exception {
        // Vulnerable: ECDSA signature
        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(privateKey);
        signature.update(data);
        return signature.sign();
    }
}`,
        after: `import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;
import org.bouncycastle.pqc.jcajce.spec.DilithiumParameterSpec;
import java.security.*;

public class SignatureExample {
    static {
        Security.addProvider(new BouncyCastlePQCProvider());
    }
     
    public byte[] signData(byte[] data, PrivateKey privateKey) 
            throws Exception {
        // Quantum-safe: Dilithium signature
        Signature signature = Signature.getInstance("Dilithium", "BCPQC");
        signature.initSign(privateKey);
        signature.update(data);
        return signature.sign();
    }
}`,
        changes: [
            'Replaced ECDSA with Dilithium3',
            'Added BouncyCastle PQC provider',
            'Updated signature algorithm'
        ],
        improvements: [
            'Quantum-resistant signatures',
            'NIST standardized',
            'Similar performance to ECDSA'
        ],
        notes: 'Dilithium3 recommended for most applications.',
        libraries: ['Bouncy Castle PQC']
    }
};

// Export to window
if (typeof window !== 'undefined') {
    window.CODE_TEMPLATES = CODE_TEMPLATES;
}

console.log('✅ Templates loaded successfully:', Object.keys(CODE_TEMPLATES).length, 'templates');
    
