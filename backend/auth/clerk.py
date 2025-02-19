from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt.algorithms import RSAAlgorithm
import jwt
import requests
import os
from datetime import datetime


security = HTTPBearer()

def get_clerk_public_keys():
    try:
        response = requests.get(os.getenv("CLERK_JWKS_URL"))
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=500, 
                detail="Failed to fetch Clerk public keys"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching Clerk public keys: {str(e)}"
        )

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    
    try:
        jwks = get_clerk_public_keys()
        unverified_header = jwt.get_unverified_header(token)
        
        rsa_key = None
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = RSAAlgorithm.from_jwk(key)
                break

        if rsa_key is None:
            raise HTTPException(
                status_code=401, 
                detail="Unable to find appropriate key"
            )

        decoded_token = jwt.decode(
            token,
            key=rsa_key,
            algorithms=["RS256"],
            options={
                "verify_aud": False,
                "verify_exp": True,
            },
            leeway=60,
            issuer=os.getenv("CLERK_ISSUER")
        )

        if decoded_token.get("azp") != os.getenv("CLERK_AUDIENCE"):
            raise HTTPException(
                status_code=401, 
                detail="Invalid authorized party"
            )

        return decoded_token

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, 
            detail="Token has expired. Please refresh your session."
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=401, 
            detail="Invalid token issuer"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401, 
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail=f"Authentication failed: {str(e)}"
        ) 