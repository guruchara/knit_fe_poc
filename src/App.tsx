import { useEffect, useRef } from "react";

/* 
 Notes: 
   We can't skip the continue step because if user's if not enabled the category then knit ui will not identity the category can't process moving ahead
*/
function App() {
  const knitRef = useRef<HTMLElement>(null);
  // Backend call to generate & get the authSessionToken
  const newSessionFn = () => {
    const requestBody = {
      originOrgId: "testingGuru100",
      originOrgName: "CodeStream_1",
      originUserEmail: "gurucharan.chouhan+1000@skuad.io",
      originUserName: "gurucharan_chouhan",
      // this is dummy addition for skip the continue step and select app step. 
      filters: [
        {
          "apps": [
            // This only for the bambooHr 
            // "bamboohr"
            //This for the quickbooks 
            "quickbooks"
          ],
          // This only for the bambooHr Category
          //  "category": "HRIS"

          //This for the quickbooks 
          "category": "ACCOUNTING"
        }
      ]
    };
  
    fetch('http://localhost:3001/getSessionToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(res => res.json())
      .then((r) => {
        if (r.success) {
          console.log("result33",r)
          // Handle the token (e.g., save it in localStorage or pass it to the UI component)
          knitRef?.current?.setAttribute("authsessiontoken", r.token);
          console.log('SessionToken:', r.token);
        } else {
          console.error('Failed to get token:', r.error);
        }
      })
      .catch((err) => {
        console.error('Error:', err);
      });
  };
  

  // Upon finishing the integration flow
  const onFinishFn = (e: CustomEvent) => {
    e?.preventDefault();
    console.log(e["detail"]["integration-id"]);
  };
	
	// Upon deactivate of integration
  const onDeactivateFn = (e: CustomEvent) => {
    e?.preventDefault();
    console.log(e["detail"]["integrationDetails"]);
  };

  // Upon closing of the knit-auth component
  const onKnitCloseFn = (e: CustomEvent) => {
    e?.preventDefault();
    console.log(e["detail"]["knitClosed"]);
  };

  useEffect(() => {
    // Assign functions to event listeners for onNewSession and onFinish events.
    knitRef.current?.addEventListener("onNewSession", newSessionFn as EventListener);
    knitRef.current?.addEventListener("onFinish", onFinishFn  as EventListener);
    knitRef.current?.addEventListener("onDeactivate", onDeactivateFn as EventListener);
    knitRef.current?.addEventListener("onKnitClose", onKnitCloseFn as EventListener);
    // Set the token once the component has mounted
    newSessionFn();

    return () => {
      // Remove events listeners on unmount
      knitRef.current?.removeEventListener("onNewSession", newSessionFn as EventListener);
      knitRef.current?.removeEventListener("onFinish", onFinishFn as EventListener);
      knitRef.current?.removeEventListener("onDeactivate", onDeactivateFn as EventListener);
      knitRef.current?.removeEventListener("onKnitClose", onKnitCloseFn as EventListener);
    };
  }, []);

  return (
    <knit-auth ref={knitRef}>
      <button slot="trigger">Add to Skuad</button>
    </knit-auth>
  );
}

export default App;
