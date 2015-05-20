
import json

hash_error = json.dumps({
                            "type": "error", 
                            "error_msg": "Your message was rejected because your key is not valid."
                    })

owner_error = json.dumps({
                            "type": "error", 
                            "error_msg": "You are trying to edit a message that is not yours. Go play with http://root-me.org/ instead."
                    })

old_content_error = json.dumps({
                            "type": "error", 
                            "error_msg": "Edition failed because of a checksum failure."
                    })
