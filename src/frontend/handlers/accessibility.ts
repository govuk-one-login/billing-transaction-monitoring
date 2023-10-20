import { PageParamsGetter, PageTitleGetter} from "../pages";


export type AccessibilityParams ={
  organizationName: string;
  statementScope: string;
  wcagVersion: string;
  websiteOrApp: string;
  statementDate: string;
  statementPreparationMethod: string;
  statementLastReviewDate: string;
}

export const accessibilityParamsGetter: PageParamsGetter<{},AccessibilityParams> = async () => {
  // Fetch data from your data source, database, or any other source
  // For porpuse, we'll just return static data
  return {
    organizationName: 'Government Digital Service (GDS)',
    statementScope: 'We want as many people as possible to be able to use this website. For example, that means you should be able to:<br>Change colours, contrast levels and fonts using browser or device settings;<br>Zoom in up to 400% without the text spilling off the screen;<br>Navigate most of the website using a keyboard or speech recognition software;<br>Listen to most of the website using a screen reader (including the most recent versions of JAWS, NVDA, and VoiceOver);<br>We have also made the website text as simple as possible to understand.',
    wcagVersion: '2.1',
    statementDate: '13th of October 2023',
    websiteOrApp: 'website',
    statementPreparationMethod: 'This statement was prepared on 13th of October 2023.',
    statementLastReviewDate: '13th of October 2023',
  };
};

export const accesabilityTitleGetter: PageTitleGetter<{}> = async () =>
   "Accessibility";