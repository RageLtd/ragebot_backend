import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../components/Button/Button";
import RadioInput from "../../components/RadioInput/RadioInput";

interface SubscribeViewProps {
  twitchUserInfo: {
    username?: string;
  };
}

export default function SubscribeView({ twitchUserInfo }: SubscribeViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(true);

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsYearly(e.target.value === "yearly");
  return (
    <>
      <h2>Upgrade to Ragebot Premium</h2>
      <section>
        <h3>Pricing</h3>
        <RadioInput
          onChange={handleDurationChange}
          name="duration"
          value="monthly"
          checked={!isYearly}
        >
          Monthly
        </RadioInput>
        <RadioInput
          onChange={handleDurationChange}
          name="duration"
          value="yearly"
          checked={isYearly}
        >
          Yearly
        </RadioInput>
      </section>
    </>
  );
}
